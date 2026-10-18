import { RedisKeys } from '@/server/modules/Redis';

import { getRedisServiceClient } from './client';

const getClient = () => getRedisServiceClient('agentSteer');

// A queue outlives a long run with room to spare; one abandoned by a run that
// never ended expires instead of being replayed into a later, unrelated turn.
const QUEUE_TTL_SECONDS = 24 * 60 * 60;

/** Upper bound on follow-ups waiting behind one turn. */
export const STEER_QUEUE_MAX_ENTRIES = 20;

/**
 * One user's queue on one conversation surface: the topic's main spine, or one
 * of its threads. Keyed by the user too — workspace members can each have a run
 * on the same surface, and each run drains only its own owner's follow-ups.
 */
export interface SteerQueueScope {
  threadId?: string | null;
  topicId: string;
  userId: string;
}

export interface SteerQueueEntry {
  createdAt: number;
  id: string;
}

/** KEYS[1] = queue; ARGV[1] = entry; ARGV[2] = ttl seconds; ARGV[3] = max entries */
const APPEND_SCRIPT = `
if redis.call('LLEN', KEYS[1]) >= tonumber(ARGV[3]) then return -1 end
local length = redis.call('RPUSH', KEYS[1], ARGV[1])
redis.call('EXPIRE', KEYS[1], ARGV[2])
return length
`;

/** KEYS[1] = queue */
const LIST_SCRIPT = `return redis.call('LRANGE', KEYS[1], 0, -1)`;

/** KEYS[1] = queue */
const LENGTH_SCRIPT = `return redis.call('LLEN', KEYS[1])`;

/** KEYS[1] = queue; ARGV[1] = the stored entry, byte for byte */
const REMOVE_SCRIPT = `return redis.call('LREM', KEYS[1], 1, ARGV[1])`;

/** Takes every entry and empties the queue in one step. KEYS[1] = queue */
const DRAIN_SCRIPT = `
local entries = redis.call('LRANGE', KEYS[1], 0, -1)
redis.call('DEL', KEYS[1])
return entries
`;

/**
 * Puts entries back at the head, in order, then holds the queue to its bound:
 * entries queued since the drain may have filled it again, and the overflow
 * (the newest, at the tail) is dropped and counted.
 *
 * KEYS[1] = queue; ARGV[1] = ttl; ARGV[2] = max entries; ARGV[3..] = entries
 */
const RESTORE_SCRIPT = `
for i = #ARGV, 3, -1 do
  redis.call('LPUSH', KEYS[1], ARGV[i])
end
redis.call('EXPIRE', KEYS[1], ARGV[1])
local max = tonumber(ARGV[2])
local length = redis.call('LLEN', KEYS[1])
if length <= max then return 0 end
redis.call('LTRIM', KEYS[1], 0, max - 1)
return length - max
`;

const keyOf = (scope: SteerQueueScope) =>
  RedisKeys.agentSteer.followUps(scope.userId, scope.topicId, scope.threadId);

const parseEntries = <T extends SteerQueueEntry>(raw: unknown): { entry: T; raw: string }[] => {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (typeof item !== 'string') return [];
    try {
      return [{ entry: JSON.parse(item) as T, raw: item }];
    } catch {
      return [];
    }
  });
};

/**
 * Follow-ups a user queued behind a running turn, held server-side so the
 * runtime can start the next turn without a round trip through the client.
 *
 * `append` returns `undefined` when Redis is unavailable: the caller then
 * tells the client to send the message itself, as it did before this queue.
 * `restore` rejects instead — the entries it carries are already out of the
 * queue, so its caller must know they could not go back.
 */
export const steerQueue = {
  /**
   * Adds an entry at the tail.
   *
   * @returns the queue length, `'full'` at {@link STEER_QUEUE_MAX_ENTRIES}, or
   * `undefined` without Redis
   */
  async append(scope: SteerQueueScope, entry: SteerQueueEntry) {
    const redis = await getClient();
    if (!redis) return;

    try {
      const length = await redis.eval<number>(
        APPEND_SCRIPT,
        1,
        keyOf(scope),
        JSON.stringify(entry),
        QUEUE_TTL_SECONDS,
        STEER_QUEUE_MAX_ENTRIES,
      );
      return Number(length) < 0 ? ('full' as const) : Number(length);
    } catch {
      // A failed command counts as no Redis: the follow-up was not stored, and
      // the caller falls back to a direct send instead of failing the request.
      return;
    }
  },

  /** Takes every entry, oldest first, leaving the queue empty. */
  async drain<T extends SteerQueueEntry>(scope: SteerQueueScope): Promise<T[]> {
    const redis = await getClient();
    if (!redis) return [];

    const raw = await redis.eval<unknown>(DRAIN_SCRIPT, 1, keyOf(scope));
    return parseEntries<T>(raw).map(({ entry }) => entry);
  },

  /** Number of waiting entries; `0` without Redis. */
  async length(scope: SteerQueueScope): Promise<number> {
    const redis = await getClient();
    if (!redis) return 0;

    return Number(await redis.eval<number>(LENGTH_SCRIPT, 1, keyOf(scope)));
  },

  /** Every waiting entry, oldest first. */
  async list<T extends SteerQueueEntry>(scope: SteerQueueScope): Promise<T[]> {
    const redis = await getClient();
    if (!redis) return [];

    const raw = await redis.eval<unknown>(LIST_SCRIPT, 1, keyOf(scope));
    return parseEntries<T>(raw).map(({ entry }) => entry);
  },

  /**
   * Removes one entry by id.
   *
   * @returns `true` when this call removed it — `false` when it was never
   * there or a drain already took it
   */
  async remove(scope: SteerQueueScope, id: string): Promise<boolean> {
    const redis = await getClient();
    if (!redis) return false;

    const key = keyOf(scope);
    const raw = await redis.eval<unknown>(LIST_SCRIPT, 1, key);
    const target = parseEntries(raw).find(({ entry }) => entry.id === id);
    if (!target) return false;

    return Number(await redis.eval<number>(REMOVE_SCRIPT, 1, key, target.raw)) > 0;
  },

  /**
   * Puts drained entries back at the head, ahead of anything queued since,
   * keeping the queue within {@link STEER_QUEUE_MAX_ENTRIES}.
   * Rejects when Redis is unavailable: the entries are out of the queue already.
   *
   * @returns how many entries the bound dropped (the newest)
   */
  async restore(scope: SteerQueueScope, entries: SteerQueueEntry[]): Promise<number> {
    if (entries.length === 0) return 0;

    const redis = await getClient();
    if (!redis) throw new Error('Redis is unavailable to restore queued follow-ups');

    const dropped = await redis.eval<number>(
      RESTORE_SCRIPT,
      1,
      keyOf(scope),
      QUEUE_TTL_SECONDS,
      STEER_QUEUE_MAX_ENTRIES,
      ...entries.map((entry) => JSON.stringify(entry)),
    );
    return Number(dropped) || 0;
  },
};
