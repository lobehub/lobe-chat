// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AGENT_SIGNAL_DEFAULTS } from '../../../../constants';
import { claimNightlyReviewTopics } from '../topicQuota';

interface AgentSignalRedisTestGlobal {
  __agentSignalRedisClient?: unknown;
}

const sets = new Map<string, Set<string>>();

/**
 * Executes the claim script's semantics against an in-memory set, the way Redis would run the
 * Lua atomically: ids already in the set are admitted for free, new ids only while under limit.
 */
const redis = {
  eval: vi.fn(async (_script: string, _keys: number, key: string, ...args: unknown[]) => {
    const [limit, , ...ids] = args as [number, number, ...string[]];
    const set = sets.get(key) ?? new Set<string>();
    sets.set(key, set);
    const admitted: string[] = [];
    for (const id of ids) {
      if (set.has(id)) admitted.push(id);
      else if (set.size < Number(limit)) {
        set.add(id);
        admitted.push(id);
      }
    }
    return admitted;
  }),
};

const setRedis = (value: unknown) => {
  (globalThis as AgentSignalRedisTestGlobal).__agentSignalRedisClient = value;
};

const topics = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index}`);

describe('claimNightlyReviewTopics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sets.clear();
    setRedis(redis);
  });

  afterEach(() => {
    setRedis(undefined);
  });

  it('caps one user at 50 distinct topics per night across agents', async () => {
    expect(AGENT_SIGNAL_DEFAULTS.nightlyReviewTopicLimitPerUser).toBe(50);

    const first = await claimNightlyReviewTopics({
      localDate: '2026-10-11',
      topicIds: topics('agent-a', 30),
      userId: 'u1',
    });
    const second = await claimNightlyReviewTopics({
      localDate: '2026-10-11',
      topicIds: topics('agent-b', 30),
      userId: 'u1',
    });
    const third = await claimNightlyReviewTopics({
      localDate: '2026-10-11',
      topicIds: topics('agent-c', 5),
      userId: 'u1',
    });

    expect(first).toEqual({ admitted: topics('agent-a', 30) });
    expect(second).toEqual({ admitted: topics('agent-b', 20), reason: 'exhausted' });
    expect(third).toEqual({ admitted: [], reason: 'exhausted' });
    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      'agent-signal:nightly-topics:user:u1:date:2026-10-11',
      50,
      AGENT_SIGNAL_DEFAULTS.nightlyReviewTopicQuotaTtlSeconds,
      ...topics('agent-c', 5),
    );
  });

  it('does not double-count topics on a replay or a second pass', async () => {
    const input = { localDate: '2026-10-11', topicIds: topics('t', 50), userId: 'u1' };

    await claimNightlyReviewTopics(input);
    const replay = await claimNightlyReviewTopics(input);

    expect(replay).toEqual({ admitted: topics('t', 50) });
  });

  it('keeps separate quotas per user and per night', async () => {
    await claimNightlyReviewTopics({
      localDate: '2026-10-11',
      topicIds: topics('t', 50),
      userId: 'u1',
    });

    await expect(
      claimNightlyReviewTopics({ localDate: '2026-10-12', topicIds: ['n'], userId: 'u1' }),
    ).resolves.toEqual({ admitted: ['n'] });
    await expect(
      claimNightlyReviewTopics({ localDate: '2026-10-11', topicIds: ['o'], userId: 'u2' }),
    ).resolves.toEqual({ admitted: ['o'] });
  });

  it('fails closed when Redis is not configured', async () => {
    setRedis(null);

    await expect(
      claimNightlyReviewTopics({ localDate: '2026-10-11', topicIds: ['t'], userId: 'u1' }),
    ).resolves.toEqual({ admitted: [], reason: 'unavailable' });
  });

  it('fails closed without throwing when Redis errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    redis.eval.mockRejectedValueOnce(new Error('connection reset'));

    await expect(
      claimNightlyReviewTopics({ localDate: '2026-10-11', topicIds: ['t'], userId: 'u1' }),
    ).resolves.toEqual({ admitted: [], reason: 'unavailable' });
    consoleError.mockRestore();
  });
});
