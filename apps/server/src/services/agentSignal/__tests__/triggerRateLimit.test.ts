import { afterEach, describe, expect, it } from 'vitest';

import {
  AGENT_SIGNAL_TRIGGER_RATE_LIMIT_PER_HOUR,
  assertAgentSignalTriggerRateLimit,
  consumeAgentSignalTriggerQuota,
} from '../triggerRateLimit';

interface AgentSignalRedisTestGlobal {
  __agentSignalRedisClient?: unknown;
}

/** Minimal in-memory Redis covering `SET … EX … NX` and `INCR`. */
const createFakeRedis = () => {
  const values = new Map<string, number>();
  const ttls = new Map<string, number>();

  return {
    incr: async (key: string) => {
      const next = (values.get(key) ?? 0) + 1;
      values.set(key, next);
      return next;
    },
    set: async (key: string, value: string, _ex: 'EX', seconds: number, _nx: 'NX') => {
      if (values.has(key)) return null;
      values.set(key, Number(value));
      ttls.set(key, seconds);
      return 'OK' as const;
    },
    ttls,
  };
};

afterEach(() => {
  (globalThis as AgentSignalRedisTestGlobal).__agentSignalRedisClient = undefined;
});

describe('consumeAgentSignalTriggerQuota', () => {
  /**
   * ROOT CAUSE:
   *
   * `triggerSourceEvent` had no rate limit, so one user could enqueue model-backed Agent Signal
   * workflows as fast as they could call the endpoint.
   */
  it(`allows ${AGENT_SIGNAL_TRIGGER_RATE_LIMIT_PER_HOUR} triggers per hour per user`, async () => {
    const redis = createFakeRedis();
    const results: boolean[] = [];

    for (let index = 0; index <= AGENT_SIGNAL_TRIGGER_RATE_LIMIT_PER_HOUR; index += 1) {
      results.push(await consumeAgentSignalTriggerQuota('user-1', redis as never));
    }

    expect(results.filter(Boolean)).toHaveLength(AGENT_SIGNAL_TRIGGER_RATE_LIMIT_PER_HOUR);
    expect(results.at(-1)).toBe(false);
    // Another user keeps their own budget.
    await expect(consumeAgentSignalTriggerQuota('user-2', redis as never)).resolves.toBe(true);
  });

  it('creates each bucket with a one-hour TTL', async () => {
    const redis = createFakeRedis();

    await consumeAgentSignalTriggerQuota('user-1', redis as never);

    expect(redis.ttls.get('agent-signal:trigger-rate:user:user-1')).toBe(3600);
  });

  it('allows the call when Redis is not configured', async () => {
    await expect(consumeAgentSignalTriggerQuota('user-1', null)).resolves.toBe(true);
  });
});

describe('assertAgentSignalTriggerRateLimit', () => {
  it('throws TOO_MANY_REQUESTS once the budget is spent', async () => {
    (globalThis as AgentSignalRedisTestGlobal).__agentSignalRedisClient = createFakeRedis();

    for (let index = 0; index < AGENT_SIGNAL_TRIGGER_RATE_LIMIT_PER_HOUR; index += 1) {
      await assertAgentSignalTriggerRateLimit('user-1');
    }

    await expect(assertAgentSignalTriggerRateLimit('user-1')).rejects.toMatchObject({
      code: 'TOO_MANY_REQUESTS',
    });
  });
});
