// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChannelCoordinator } from './ChannelCoordinator';

const { executions, executeToolCall, interruptTask } = vi.hoisted(() => ({
  interruptTask: vi.fn().mockResolvedValue({ success: true }),
  executions: {
    publish: vi.fn(),
    releaseWriter: vi.fn(),
    retireReservation: vi.fn().mockResolvedValue(false),
  },
  executeToolCall: vi.fn(),
}));
vi.mock('@/database/repositories/channel', () => ({
  ChannelExecutionRepository: class {
    constructor() {
      return executions;
    }
  },
}));
vi.mock('@/server/services/aiAgent', () => ({
  AiAgentService: class {
    interruptTask = interruptTask;
  },
}));
vi.mock('@/server/services/deviceGateway', () => ({ deviceGateway: { executeToolCall } }));
vi.mock('@/server/globalConfig', () => ({ getServerDefaultAgentConfig: vi.fn() }));
vi.mock('@/server/services/deviceGateway/scopedDevices', () => ({
  getScopedOnlineDevices: vi.fn(),
}));
vi.mock('@/server/services/queue/impls', () => ({ isQueueAgentRuntimeEnabled: vi.fn() }));
vi.mock('./attachments', () => ({ resolveChannelAttachments: vi.fn() }));
vi.mock('./notify', () => ({ notifyChannel: vi.fn() }));
vi.mock('./queue', () => ({ registerLocalChannelAdvance: vi.fn(), wakeChannel: vi.fn() }));

describe('Channel completion physical writer confirmation', () => {
  beforeEach(() => vi.clearAllMocks());

  const coordinator = (publicationRevoked = false, runtime = 'codex') => {
    const job = {
      channelId: 'channel',
      draft: 'Final reply',
      id: 'job',
      leaseOwner: null,
      manifest: {},
      operationId: 'op',
      publicationRevoked,
      writerHeld: true,
    };
    const operation = { id: 'op', status: 'done', userId: 'user', workspaceId: null };
    const rows = [
      {
        ...job,
        job,
        operation,
        config: { runtime, deviceId: 'device', deviceOwnerId: 'owner' },
      },
    ];
    const query = Object.assign(Promise.resolve(rows), {
      from: vi.fn(),
      innerJoin: vi.fn(),
      leftJoin: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
    });
    for (const method of ['from', 'innerJoin', 'leftJoin', 'where', 'limit'] as const)
      query[method].mockReturnValue(query);
    return new ChannelCoordinator({ select: () => query } as never);
  };

  it.each([false, true])(
    'keeps the directory held without physical confirmation (revoked: %s)',
    async (revoked) => {
      executeToolCall.mockResolvedValue({ success: true, state: { exited: false } });
      await coordinator(revoked).complete('channel', 'job', 'op');
      expect(executions.releaseWriter).not.toHaveBeenCalled();
      expect(executeToolCall).toHaveBeenCalled();
      expect(executions.publish).toHaveBeenCalledTimes(revoked ? 0 : 1);
    },
  );

  it('releases a completed writer only after the device confirms termination', async () => {
    executeToolCall.mockResolvedValue({ success: true, state: { exited: true } });
    await coordinator().complete('channel', 'job', 'op');
    expect(executeToolCall).toHaveBeenCalled();
    expect(executions.releaseWriter).toHaveBeenCalledWith('channel', 'job');
  });

  it.each([false, true])(
    'does not release a Native writer on runtime interruption alone (revoked: %s)',
    async (revoked) => {
      executeToolCall.mockResolvedValue({ success: true, state: { exited: false } });
      await coordinator(revoked, 'native').complete('channel', 'job', 'op');
      expect(executions.releaseWriter).not.toHaveBeenCalled();
    },
  );

  it('releases a Native writer only after its device tools and processes have drained', async () => {
    executeToolCall.mockResolvedValue({ success: true, state: { exited: true } });
    await coordinator(true, 'native').complete('channel', 'job', 'op');
    expect(executeToolCall).toHaveBeenCalled();
    expect(executions.releaseWriter).toHaveBeenCalledWith('channel', 'job');
  });
});
