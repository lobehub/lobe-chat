import type * as LobechatConstModule from '@lobechat/const';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { agentService } from '@/services/agent';
import { type ProjectDirectory, useProjectDirectoryStore } from '@/store/projectWorkingDirectory';
import { getSessionStoreState } from '@/store/session';
import { useUserStore } from '@/store/user';

import { useChatStore } from '../../../../store';
import { createMockAgentConfig, TEST_IDS } from './fixtures';
import { resetTestEnvironment, setupMockSelectors, spyOnMessageService } from './helpers';

const mockConstEnv = vi.hoisted(() => ({ isDesktop: false }));

vi.mock('@lobechat/const', async (importOriginal) => {
  const actual = await importOriginal<typeof LobechatConstModule>();
  return {
    ...actual,
    get isDesktop() {
      return mockConstEnv.isDesktop;
    },
  };
});

vi.mock('@/services/resourcePermission', () => ({
  resourcePermissionService: { getGeneralAccess: vi.fn() },
}));

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    session: { updateSession: { mutate: vi.fn().mockResolvedValue(undefined) } },
  },
}));

const DEVICE_ID = 'device-85';
const PROJECT_PATH = '/repo/project';
const AGENT_DEFAULT_PATH = '/repo/agent-default';

const directoryRow = {
  deviceId: DEVICE_ID,
  environmentId: 'env-85',
  id: 'dir-85',
  instanceId: 'inst-85',
  path: PROJECT_PATH,
  projectId: 'prj-1',
} as ProjectDirectory;

beforeEach(() => {
  resetTestEnvironment();
  spyOnMessageService();
  vi.spyOn(getSessionStoreState(), 'triggerSessionUpdate').mockResolvedValue(undefined);
  vi.spyOn(agentService, 'getAgentConfigById').mockResolvedValue(createMockAgentConfig() as any);
  useUserStore.setState({ workspaceUserPreference: {} });
  useProjectDirectoryStore.setState({ directoriesMap: { all: [directoryRow] } });

  act(() => {
    useChatStore.setState({
      executeClientAgent: vi.fn(),
      mainInputEditor: null,
      refreshMessages: vi.fn(),
      refreshTopic: vi.fn(),
    });
  });
});

afterEach(() => {
  mockConstEnv.isDesktop = false;
  useProjectDirectoryStore.setState({ directoriesMap: {} });
  vi.restoreAllMocks();
});

describe('sendMessage in a project directory', () => {
  // Regression: the new topic's optimistic metadata took the agent's own
  // per-device directory, and the send-time git snapshot wrote that config back
  // over the server's project binding — the composer then showed another repo's
  // branch, and the next turn was refused for a mismatched directory.
  it('seeds the new topic with the project directory, not the agent default', async () => {
    mockConstEnv.isDesktop = true;
    setupMockSelectors({
      agentConfig: {
        agencyConfig: {
          boundDeviceId: DEVICE_ID,
          executionTarget: 'device',
          workingDirByDevice: { [DEVICE_ID]: AGENT_DEFAULT_PATH },
        },
      },
    });
    const executeGatewayAgentSpy = vi.fn().mockResolvedValue({ topicId: 'tpc_new' });
    const agentId = TEST_IDS.SESSION_ID;

    act(() => {
      useChatStore.setState({
        activeAgentId: agentId,
        activeTopicId: undefined,
        executeGatewayAgent: executeGatewayAgentSpy,
        isGatewayModeEnabled: () => true,
        pendingNewTopicDirectory: { agentId, projectWorkingDirectoryId: 'dir-85' },
      });
    });

    const { result } = renderHook(() => useChatStore());
    await act(async () => {
      await result.current.sendMessage({
        context: { agentId, threadId: null, topicId: null },
        message: 'Start in the project',
      });
    });

    expect(executeGatewayAgentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        optimisticTopic: expect.objectContaining({
          metadata: expect.objectContaining({
            workingDirectory: PROJECT_PATH,
            workingDirectoryConfig: { path: PROJECT_PATH },
          }),
        }),
        projectWorkingDirectoryId: 'dir-85',
      }),
    );
  });
});
