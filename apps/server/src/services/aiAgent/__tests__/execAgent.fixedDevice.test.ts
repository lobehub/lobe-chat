import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mockCreateOperation,
  mockDeviceProxy,
  mockMessageCreate,
  mockMessageUpdate,
  topicMock,
} from './execAgent.device.testUtils';

const { AiAgentService } = await import('../index');

describe('AiAgentService.execAgent - fixed execution target', () => {
  let service: InstanceType<typeof AiAgentService>;
  const mockDb = {} as any;
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    topicMock.create.mockResolvedValue({ id: 'topic-1', metadata: undefined });
    topicMock.findById.mockResolvedValue(undefined);
    topicMock.updateMetadata.mockResolvedValue(undefined);
    mockMessageCreate.mockResolvedValue({ id: 'msg-1' });
    mockMessageUpdate.mockResolvedValue({});
    mockCreateOperation.mockResolvedValue({
      autoStarted: true,
      messageId: 'queue-msg-1',
      operationId: 'op-123',
      success: true,
    });
    // Reset device proxy state
    mockDeviceProxy.isConfigured = false;
    mockDeviceProxy.queryDeviceList.mockResolvedValue([]);

    service = new AiAgentService(mockDb, userId);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const onlineDevice = {
    deviceId: 'device-001',
    hostname: 'my-laptop',
    lastSeen: '2026-03-06T12:00:00.000Z',
    online: true,
    platform: 'linux' as const,
  };

  const onlineDevice2 = {
    deviceId: 'device-002',
    hostname: 'my-desktop',
    lastSeen: '2026-03-06T12:00:00.000Z',
    online: true,
    platform: 'darwin' as const,
  };

  // Override the agent's agencyConfig and rebuild the service. Auto-activation
  // is now exclusive to `executionTarget: 'auto'` — the default (`local`) never
  // grabs a device — so the auto-activation specs opt in explicitly.
  const useAgencyConfig = async (agencyConfig: Record<string, unknown>) => {
    const { AgentService } = await import('@/server/services/agent');
    vi.mocked(AgentService).mockImplementation(function () {
      return {
        getAgentConfig: vi.fn().mockResolvedValue({
          agencyConfig,
          chatConfig: {},
          files: [],
          id: 'agent-1',
          knowledgeBases: [],
          model: 'gpt-4',
          plugins: [],
          provider: 'openai',
          systemRole: 'You are a helpful assistant',
        }),
      } as any;
    });
    service = new AiAgentService(mockDb, userId);
  };

  it('uses the shared fixed device even when the request asks for another device', async () => {
    mockDeviceProxy.isConfigured = true;
    mockDeviceProxy.queryDeviceList.mockResolvedValue([onlineDevice, onlineDevice2]);
    await useAgencyConfig({
      boundDeviceId: 'device-001',
      executionTargetSelectionPolicy: 'fixed',
      executionTarget: 'device',
    });
    service = new AiAgentService(mockDb, userId, { workspaceId: 'workspace-1' });

    await service.execAgent({
      agentId: 'agent-1',
      deviceId: 'device-002',
      prompt: 'Run a command',
    });

    expect(mockCreateOperation.mock.calls[0][0].activeDeviceId).toBe('device-001');
    expect(topicMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ boundDeviceId: 'device-001' }),
      }),
      undefined,
    );
  });

  it('keeps a fixed sandbox target when the request asks for a device', async () => {
    mockDeviceProxy.isConfigured = true;
    mockDeviceProxy.queryDeviceList.mockResolvedValue([onlineDevice]);
    await useAgencyConfig({
      executionTarget: 'sandbox',
      executionTargetSelectionPolicy: 'fixed',
    });
    service = new AiAgentService(mockDb, userId, { workspaceId: 'workspace-1' });

    await service.execAgent({
      agentId: 'agent-1',
      deviceId: 'device-001',
      prompt: 'Run a command',
    });

    expect(mockCreateOperation.mock.calls[0][0].activeDeviceId).toBeUndefined();
    expect(topicMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: undefined }),
      undefined,
    );
  });

  it('fails before operation creation when the shared fixed device is offline', async () => {
    mockDeviceProxy.isConfigured = true;
    mockDeviceProxy.queryDeviceList.mockResolvedValue([onlineDevice2]);
    await useAgencyConfig({
      boundDeviceId: 'device-001',
      executionTargetSelectionPolicy: 'fixed',
      executionTarget: 'device',
    });
    service = new AiAgentService(mockDb, userId, { workspaceId: 'workspace-1' });

    await expect(
      service.execAgent({ agentId: 'agent-1', prompt: 'Run a command' }),
    ).rejects.toMatchObject({
      cause: {
        data: {
          code: 'DEVICE_NOT_FOUND',
          deviceId: 'device-001',
          retryable: true,
          scope: 'workspace',
          workspaceId: 'workspace-1',
        },
      },
      code: 'PRECONDITION_FAILED',
    });

    expect(mockCreateOperation).not.toHaveBeenCalled();
    expect(mockMessageUpdate).toHaveBeenCalledWith(
      'msg-1',
      expect.objectContaining({
        error: expect.objectContaining({ message: 'Fixed agent device unavailable' }),
      }),
    );
  });

  it.each([
    { target: 'device' as const, boundDeviceId: 'device-001', requestedDeviceId: 'device-002' },
    { target: 'sandbox' as const, boundDeviceId: undefined, requestedDeviceId: 'device-002' },
  ])(
    'does not persist the caller cwd when a fixed $target overrides the CLI device',
    async ({ target, boundDeviceId, requestedDeviceId }) => {
      mockDeviceProxy.isConfigured = true;
      mockDeviceProxy.queryDeviceList.mockResolvedValue([onlineDevice, onlineDevice2]);
      await useAgencyConfig({
        executionTarget: target,
        executionTargetSelectionPolicy: 'fixed',
        boundDeviceId,
      });
      service = new AiAgentService(mockDb, userId, { workspaceId: 'workspace-1' });
      const initialTopicMetadata = {
        repos: ['owner/repo'],
        workingDirectory: '/caller-only/project',
        workingDirectoryConfig: { path: '/caller-only/project' },
      };
      await service.execAgent({
        agentId: 'agent-1',
        deviceId: requestedDeviceId,
        trigger: 'cli',
        prompt: 'Run a command',
        appContext: { initialTopicMetadata },
      });
      const metadata = topicMock.create.mock.calls.at(-1)![0].metadata;
      expect(metadata?.workingDirectory).toBeUndefined();
      expect(metadata?.workingDirectoryConfig).toBeUndefined();
      expect(metadata?.repos).toEqual(['owner/repo']);
      expect(initialTopicMetadata.workingDirectory).toBe('/caller-only/project');
      expect(mockCreateOperation.mock.calls.at(-1)![0].activeDeviceId).toBe(boundDeviceId);
    },
  );

  it.each([
    { workspaceId: 'workspace-1', policy: 'fixed', boundDeviceId: 'device-002' },
    { workspaceId: 'workspace-1', policy: 'member', boundDeviceId: 'device-001' },
    { workspaceId: undefined, policy: 'fixed', boundDeviceId: 'device-001' },
  ])(
    'keeps the caller cwd when its requested device is effective ($policy, $workspaceId)',
    async ({ workspaceId, policy, boundDeviceId }) => {
      mockDeviceProxy.isConfigured = true;
      mockDeviceProxy.queryDeviceList.mockResolvedValue([onlineDevice, onlineDevice2]);
      await useAgencyConfig({
        executionTarget: 'device',
        executionTargetSelectionPolicy: policy,
        boundDeviceId,
      });
      service = new AiAgentService(mockDb, userId, { workspaceId });
      await service.execAgent({
        agentId: 'agent-1',
        deviceId: 'device-002',
        trigger: 'cli',
        prompt: 'Run a command',
        appContext: {
          initialTopicMetadata: {
            workingDirectory: '/caller/project',
            workingDirectoryConfig: { path: '/caller/project' },
          },
        },
      });
      const metadata = topicMock.create.mock.calls.at(-1)![0].metadata;
      expect(metadata?.workingDirectory).toBe('/caller/project');
      expect(metadata?.workingDirectoryConfig).toEqual({ path: '/caller/project' });
      expect(mockCreateOperation.mock.calls.at(-1)![0].activeDeviceId).toBe('device-002');
    },
  );
});
