// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SteerQueueWriteUnknownError } from '@/server/services/redis/steerQueue';

import { agentSteerQueueRouter } from '../agentSteerQueue';

const mocks = vi.hoisted(() => ({
  append: vi.fn(),
  isRunningOperationAlive: vi.fn(),
  list: vi.fn(),
  liveCandidates: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@/database/models/topic', () => ({
  TopicModel: vi.fn().mockImplementation(function () {
    return { isRunningOperationAlive: mocks.isRunningOperationAlive };
  }),
}));
vi.mock('@/server/services/redis', () => ({
  redisService: {
    steerQueue: { append: mocks.append, list: mocks.list, remove: mocks.remove },
  },
}));
vi.mock('@/server/routers/lambda/_helpers/workspaceAgentGuard', () => ({
  assertCanUseWorkspaceAgent: vi.fn(),
}));
vi.mock('@/server/routers/lambda/aiAgent/guards', () => ({
  assertCanUseAgentRunConversation: vi.fn(),
}));
vi.mock('@/business/server/trpc-middlewares/rbacPermission', async () => {
  const mod = await vi.importActual<{ trpc: any }>('@/libs/trpc/lambda/init');
  return { withScopedPermission: () => mod.trpc.middleware(async (opts: any) => opts.next()) };
});
vi.mock('@/business/server/trpc-middlewares/workspaceAuth', async () => {
  const mod = await vi.importActual<{ trpc: any }>('@/libs/trpc/lambda/init');
  return { wsCompatProcedure: mod.trpc.procedure };
});
vi.mock('@/libs/trpc/lambda/middleware', () => ({
  serverDatabase: async (opts: any) => opts.next({ ctx: opts.ctx }),
}));

// The scope / owner / status filtering itself runs against a real DB in
// agentSteerQueue.liveness.test.ts; here the query only yields candidates.
const serverDB = {
  select: () => ({
    from: () => ({
      where: () => ({ orderBy: () => ({ limit: async () => mocks.liveCandidates() }) }),
    }),
  }),
};

const caller = () =>
  agentSteerQueueRouter.createCaller({
    clientIp: '1.2.3.4',
    serverDB,
    userAgent: 'test',
    userId: 'user-1',
  } as any);

const appendInput = {
  id: 'q-1',
  request: {
    agentId: 'agt-1',
    appContext: { projectWorkingDirectoryId: 'pwd-1', topicId: 'tpc-1' },
    prompt: 'also check the tests',
    streamFeatures: ['file_works'],
  },
};

describe('agentSteerQueueRouter.append', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.liveCandidates.mockReturnValue([{ id: 'op-1' }]);
    mocks.isRunningOperationAlive.mockResolvedValue(true);
    mocks.append.mockResolvedValue(1);
    mocks.remove.mockResolvedValue(true);
  });

  it('queues behind the caller’s own live run, keeping only what a later turn can use', async () => {
    await expect(caller().append(appendInput)).resolves.toEqual({
      id: 'q-1',
      length: 1,
      queued: true,
    });

    const [scope, entry, behindOperationId] = mocks.append.mock.calls[0];
    expect(behindOperationId).toBe('op-1');
    expect(scope).toEqual({ threadId: null, topicId: 'tpc-1', userId: 'user-1' });
    expect(entry).toMatchObject({
      audit: { clientIp: '1.2.3.4', userAgent: 'test' },
      id: 'q-1',
      request: {
        acceptsFileWorks: true,
        acceptsMemberRuntimeEnd: false,
        prompt: 'also check the tests',
      },
      userId: 'user-1',
    });
    expect(entry.request.appContext.projectWorkingDirectoryId).toBeUndefined();
    expect(entry.request.streamFeatures).toBeUndefined();
  });

  it('tells the client to send directly when no run is live', async () => {
    mocks.isRunningOperationAlive.mockResolvedValue(false);

    await expect(caller().append(appendInput)).resolves.toEqual({ queued: false, reason: 'idle' });
    expect(mocks.append).not.toHaveBeenCalled();
  });

  it('does not queue when no own top-level run is on the surface', async () => {
    mocks.liveCandidates.mockReturnValue([]);

    await expect(caller().append(appendInput)).resolves.toEqual({ queued: false, reason: 'idle' });
    expect(mocks.append).not.toHaveBeenCalled();
  });

  it.each(['a\tb', 'a\nb', ''])(
    'rejects an entry id the queue header cannot carry: %j',
    async (id) => {
      await expect(caller().append({ ...appendInput, id })).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
      expect(mocks.append).not.toHaveBeenCalled();
    },
  );

  it('reports queued for a retry its run already took, so the client does not send it again', async () => {
    mocks.append.mockResolvedValue('taken');

    await expect(caller().append(appendInput)).resolves.toEqual({
      id: 'q-1',
      length: 0,
      queued: true,
    });
  });

  it('refuses to guess between two live runs on the same surface', async () => {
    mocks.liveCandidates.mockReturnValue([{ id: 'op-1' }, { id: 'op-2' }]);

    await expect(caller().append(appendInput)).resolves.toEqual({
      queued: false,
      reason: 'ambiguous',
    });
    expect(mocks.append).not.toHaveBeenCalled();
  });

  it('answers neither queued nor send-directly when the write outcome is unknown', async () => {
    mocks.append.mockRejectedValue(new SteerQueueWriteUnknownError(new Error('timeout')));

    await expect(caller().append(appendInput)).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('takes the entry back when the run ended after its drain', async () => {
    mocks.isRunningOperationAlive.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(caller().append(appendInput)).resolves.toEqual({ queued: false, reason: 'idle' });
    expect(mocks.remove).toHaveBeenCalledWith(
      { threadId: null, topicId: 'tpc-1', userId: 'user-1' },
      'q-1',
    );
  });

  it('reports queued when the drain already took the entry it tried to take back', async () => {
    mocks.isRunningOperationAlive.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mocks.remove.mockResolvedValue(false);

    await expect(caller().append(appendInput)).resolves.toMatchObject({ queued: true });
  });

  it.each([
    [undefined, 'unavailable'],
    ['full', 'full'],
  ] as const)('falls back to a direct send when append returns %s', async (result, reason) => {
    mocks.append.mockResolvedValue(result);

    await expect(caller().append(appendInput)).resolves.toEqual({ queued: false, reason });
  });
});

describe('agentSteerQueueRouter.list / remove', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue([
      { createdAt: 1, id: 'mine', request: { prompt: 'a' }, userId: 'user-1' },
      { createdAt: 2, id: 'theirs', request: { prompt: 'b' }, userId: 'user-2' },
    ]);
    mocks.remove.mockResolvedValue(true);
  });

  it('lists only the caller’s own follow-ups', async () => {
    await expect(caller().list({ topicId: 'tpc-1' })).resolves.toEqual([
      { createdAt: 1, fileIds: undefined, id: 'mine', prompt: 'a' },
    ]);
  });

  it('removes only the caller’s own follow-ups', async () => {
    await expect(caller().remove({ id: 'theirs', topicId: 'tpc-1' })).resolves.toEqual({
      removed: false,
    });
    await expect(caller().remove({ id: 'mine', topicId: 'tpc-1' })).resolves.toEqual({
      removed: true,
    });
    expect(mocks.remove).toHaveBeenCalledTimes(1);
  });
});
