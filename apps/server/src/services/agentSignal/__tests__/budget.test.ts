// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { acquireAgentSignalDailyBudget, describeBudgetDenial, toUtcDay } from '../budget';
import { AGENT_SIGNAL_DEFAULTS } from '../constants';

const counters = new Map<string, number>();
const redis = {
  expire: vi.fn(async () => 1),
  incr: vi.fn(async (key: string) => {
    const next = (counters.get(key) ?? 0) + 1;
    counters.set(key, next);
    return next;
  }),
};

interface AgentSignalRedisTestGlobal {
  __agentSignalRedisClient?: unknown;
}

const setRedis = (value: unknown) => {
  (globalThis as AgentSignalRedisTestGlobal).__agentSignalRedisClient = value;
};

const NOW = Date.UTC(2026, 9, 11, 23, 30);

describe('acquireAgentSignalDailyBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    counters.clear();
    setRedis(redis);
  });

  afterEach(() => {
    setRedis(undefined);
  });

  /**
   * @example
   * Run 50 of the day is allowed; run 51 is denied with an `exceeded` reason.
   */
  it('allows runs up to the daily limit and denies the next one', async () => {
    const limit = AGENT_SIGNAL_DEFAULTS.dailyBackgroundRunBudgetPerUser;
    const decisions = [];
    for (let index = 0; index <= limit; index += 1) {
      decisions.push(
        await acquireAgentSignalDailyBudget({ kind: 'background-run', now: NOW, userId: 'u1' }),
      );
    }

    expect(decisions.slice(0, limit).every((decision) => decision.allowed)).toBe(true);
    expect(decisions[limit]).toEqual({
      allowed: false,
      count: limit + 1,
      kind: 'background-run',
      limit,
      reason: 'exceeded',
    });
    expect(redis.incr).toHaveBeenCalledWith(
      'agent-signal:budget:background-run:user:u1:day:2026-10-11',
    );
    expect(redis.expire).toHaveBeenCalledWith(
      'agent-signal:budget:background-run:user:u1:day:2026-10-11',
      AGENT_SIGNAL_DEFAULTS.dailyBudgetTtlSeconds,
    );
  });

  /**
   * Product decision: background processing (dispatched runs plus completion-path expertise
   * ingestion) shares one pool of 50 per user per UTC day; the classifier cap stays at 200.
   */
  it('caps background processing at 50 per user per day', async () => {
    counters.set('agent-signal:budget:background-run:user:u1:day:2026-10-11', 49);

    await expect(
      acquireAgentSignalDailyBudget({ kind: 'background-run', now: NOW, userId: 'u1' }),
    ).resolves.toEqual({ allowed: true, count: 50, kind: 'background-run', limit: 50 });
    await expect(
      acquireAgentSignalDailyBudget({ kind: 'background-run', now: NOW, userId: 'u1' }),
    ).resolves.toMatchObject({ allowed: false, count: 51, limit: 50, reason: 'exceeded' });
    expect(AGENT_SIGNAL_DEFAULTS.dailyFeedbackClassifierBudgetPerUser).toBe(200);
  });

  /**
   * @example
   * Budgets are per user, per kind, and per UTC day.
   */
  it('keeps separate counters per user, kind and UTC day', async () => {
    counters.set('agent-signal:budget:background-run:user:u1:day:2026-10-11', 100);

    await expect(
      acquireAgentSignalDailyBudget({ kind: 'background-run', now: NOW, userId: 'u2' }),
    ).resolves.toMatchObject({ allowed: true });
    await expect(
      acquireAgentSignalDailyBudget({ kind: 'feedback-classifier', now: NOW, userId: 'u1' }),
    ).resolves.toMatchObject({ allowed: true, limit: 200 });
    await expect(
      acquireAgentSignalDailyBudget({
        kind: 'background-run',
        now: NOW + 60 * 60 * 1000,
        userId: 'u1',
      }),
    ).resolves.toMatchObject({ allowed: true, count: 1 });
    expect(toUtcDay(NOW + 60 * 60 * 1000)).toBe('2026-10-12');
  });

  /**
   * @example
   * No Redis configured: the budget cannot be enforced, so the work is skipped.
   */
  it('fails closed when Redis is not configured', async () => {
    setRedis(null);

    await expect(
      acquireAgentSignalDailyBudget({ kind: 'background-run', now: NOW, userId: 'u1' }),
    ).resolves.toEqual({
      allowed: false,
      kind: 'background-run',
      limit: AGENT_SIGNAL_DEFAULTS.dailyBackgroundRunBudgetPerUser,
      reason: 'unavailable',
    });
  });

  /**
   * @example
   * A Redis error is logged and treated as an unavailable budget, never thrown.
   */
  it('fails closed without throwing when Redis errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    redis.incr.mockRejectedValueOnce(new Error('connection reset'));

    await expect(
      acquireAgentSignalDailyBudget({ kind: 'feedback-classifier', now: NOW, userId: 'u1' }),
    ).resolves.toMatchObject({ allowed: false, reason: 'unavailable' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('describes denials for skip details', () => {
    expect(
      describeBudgetDenial({
        allowed: false,
        kind: 'background-run',
        limit: 20,
        reason: 'exceeded',
      }),
    ).toBe('Daily Agent Signal background-run budget exceeded (20/day).');
    expect(
      describeBudgetDenial({
        allowed: false,
        kind: 'feedback-classifier',
        limit: 200,
        reason: 'unavailable',
      }),
    ).toBe(
      'Daily Agent Signal feedback-classifier budget unavailable; skipped to stay within budget.',
    );
  });
});
