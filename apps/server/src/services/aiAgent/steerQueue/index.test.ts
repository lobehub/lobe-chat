import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mergeQueuedFollowUps, type QueuedFollowUp, startQueuedFollowUp } from './index';

const { drain, restore, startComposerRun } = vi.hoisted(() => ({
  drain: vi.fn(),
  restore: vi.fn(),
  startComposerRun: vi.fn(),
}));

vi.mock('@/server/services/redis', () => ({ redisService: { steerQueue: { drain, restore } } }));
vi.mock('../composerRun', () => ({ startComposerRun }));

const followUp = (id: string, createdAt: number, request: Partial<QueuedFollowUp['request']>) =>
  ({
    audit: { clientIp: `ip-${id}` },
    createdAt,
    id,
    request: { agentId: 'agt-1', appContext: { topicId: 'tpc-1' }, prompt: id, ...request },
    userId: 'user-1',
  }) as QueuedFollowUp;

const ctx = { aiAgentService: {} as any, db: {} as any, userId: 'user-1', workspaceId: 'ws-1' };
const finished = (scope: { threadId?: string | null; topicId: string }) => ({
  operationId: 'op-1',
  scope: { threadId: null, ...scope },
});

describe('mergeQueuedFollowUps', () => {
  it('joins the texts in queue order and keeps every attachment and selection', () => {
    const merged = mergeQueuedFollowUps([
      followUp('second', 2, { fileIds: ['f2'], selectedSkillIds: ['s1'] }),
      followUp('first', 1, {
        fileIds: ['f1'],
        mentionedAgents: [{ id: 'a1', name: 'A' }],
        selectedSkillIds: ['s1'],
      }),
    ]);

    expect(merged.prompt).toBe('first\n\nsecond');
    expect(merged.fileIds).toEqual(['f1', 'f2']);
    expect(merged.selectedSkillIds).toEqual(['s1']);
    expect(merged.mentionedAgents).toEqual([{ id: 'a1', name: 'A' }]);
  });

  it('runs with the newest settings and drops per-send client ids once merged', () => {
    const merged = mergeQueuedFollowUps([
      followUp('a', 1, { clientIds: { userMessageId: 'u-a' } as any, deviceId: 'old' }),
      followUp('b', 2, { clientIds: { userMessageId: 'u-b' } as any, deviceId: 'new' }),
    ]);

    expect(merged.deviceId).toBe('new');
    expect(merged.clientIds).toBeUndefined();
    expect(
      mergeQueuedFollowUps([followUp('a', 1, { clientIds: { x: 1 } as any })]).clientIds,
    ).toEqual({ x: 1 });
  });
});

describe('startQueuedFollowUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    drain.mockResolvedValue([]);
    restore.mockResolvedValue(undefined);
    startComposerRun.mockResolvedValue({ operationId: 'op-2' });
  });

  it('starts the drained follow-ups as one steered turn on the same surface', async () => {
    drain.mockResolvedValue([followUp('a', 1, {}), followUp('b', 2, {})]);

    await expect(
      startQueuedFollowUp(ctx, finished({ threadId: 'thd-1', topicId: 'tpc-1' })),
    ).resolves.toEqual({ operationId: 'op-2' });

    expect(drain).toHaveBeenCalledWith({ threadId: 'thd-1', topicId: 'tpc-1' });
    expect(startComposerRun).toHaveBeenCalledWith(
      expect.objectContaining({ clientIp: 'ip-b', userId: 'user-1' }),
      expect.objectContaining({
        appContext: { threadId: 'thd-1', topicId: 'tpc-1' },
        prompt: 'a\n\nb',
        steer: true,
      }),
    );
  });

  it('puts the follow-ups back when the next turn cannot start', async () => {
    const entries = [followUp('a', 1, {})];
    drain.mockResolvedValue(entries);
    startComposerRun.mockRejectedValue(new Error('topic busy'));

    await expect(startQueuedFollowUp(ctx, finished({ topicId: 'tpc-1' }))).resolves.toBeUndefined();

    expect(restore).toHaveBeenCalledWith({ threadId: null, topicId: 'tpc-1' }, entries);
  });

  it('never starts a follow-up someone else queued under the run owner', async () => {
    drain.mockResolvedValue([{ ...followUp('a', 1, {}), userId: 'intruder' }]);

    await startQueuedFollowUp(ctx, finished({ topicId: 'tpc-1' }));

    expect(startComposerRun).not.toHaveBeenCalled();
  });
});
