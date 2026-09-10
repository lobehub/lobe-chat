import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAgentRuntimeRedisClient = vi.hoisted(() => vi.fn());

vi.mock('@/server/modules/AgentRuntime/redis', () => ({
  getAgentRuntimeRedisClient: mockGetAgentRuntimeRedisClient,
}));

const {
  buildDeferredMessagesKey,
  deferBotMessages,
  drainDeferredBotMessages,
  isDeferredMessagesAvailable,
} = await import('../deferredMessages');

/** Minimal ioredis `multi()` chain recorder. */
function createRedis(execResult: unknown = []) {
  const calls: Array<[string, ...unknown[]]> = [];
  const chain: any = {};
  for (const cmd of ['rpush', 'ltrim', 'expire', 'lrange', 'del']) {
    chain[cmd] = vi.fn((...args: unknown[]) => {
      calls.push([cmd, ...args]);
      return chain;
    });
  }
  chain.exec = vi.fn().mockResolvedValue(execResult);
  return { calls, chain, multi: vi.fn(() => chain) };
}

const makeMessage = (id: string) => ({ id, toJSON: () => ({ _type: 'chat:Message', id }) }) as any;

describe('deferredMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds a key scoped by application and thread', () => {
    expect(buildDeferredMessagesKey('app-1', 'wechat:single:u')).toBe(
      'bot:deferred-messages:app-1:wechat:single:u',
    );
  });

  it('reports unavailable and stores nothing without Redis', async () => {
    mockGetAgentRuntimeRedisClient.mockReturnValue(null);

    expect(isDeferredMessagesAvailable()).toBe(false);
    await expect(deferBotMessages('app-1', 't', [makeMessage('1')])).resolves.toBe(false);
    await expect(drainDeferredBotMessages('app-1', 't')).resolves.toEqual([]);
  });

  it('appends serialized messages in order with a cap and TTL', async () => {
    const redis = createRedis();
    mockGetAgentRuntimeRedisClient.mockReturnValue(redis);

    const ok = await deferBotMessages('app-1', 't', [makeMessage('1'), makeMessage('2')]);

    expect(ok).toBe(true);
    expect(redis.calls[0]).toEqual([
      'rpush',
      'bot:deferred-messages:app-1:t',
      JSON.stringify({ _type: 'chat:Message', id: '1' }),
      JSON.stringify({ _type: 'chat:Message', id: '2' }),
    ]);
    expect(redis.calls[1]).toEqual(['ltrim', 'bot:deferred-messages:app-1:t', -20, -1]);
    expect(redis.calls[2]).toEqual(['expire', 'bot:deferred-messages:app-1:t', 30 * 60]);
  });

  it('returns false when the write fails so callers keep the fallback path', async () => {
    const redis = createRedis();
    redis.chain.exec.mockRejectedValue(new Error('boom'));
    mockGetAgentRuntimeRedisClient.mockReturnValue(redis);

    await expect(deferBotMessages('app-1', 't', [makeMessage('1')])).resolves.toBe(false);
  });

  it('drains every entry oldest-first, deletes the key and skips corrupt entries', async () => {
    const redis = createRedis([
      [null, ['{"id":"1"}', 'not json', '{"id":"2"}']],
      [null, 1],
    ]);
    mockGetAgentRuntimeRedisClient.mockReturnValue(redis);

    const entries = await drainDeferredBotMessages('app-1', 't');

    expect(entries).toEqual([{ id: '1' }, { id: '2' }]);
    expect(redis.calls).toEqual([
      ['lrange', 'bot:deferred-messages:app-1:t', 0, -1],
      ['del', 'bot:deferred-messages:app-1:t'],
    ]);
  });
});
