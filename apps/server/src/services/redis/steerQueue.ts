import { RedisKeys } from '@/server/modules/Redis';

import { getRedisServiceClient } from './client';

const getClient = () => getRedisServiceClient('agentSteer');

// A queue outlives a long run with room to spare; one abandoned by a run that
// never ended expires instead of being replayed into a later, unrelated turn.
const QUEUE_TTL_SECONDS = 24 * 60 * 60;

/**
 * Upper bound on follow-ups waiting behind one turn, counting the ones a run
 * has taken but not yet delivered (their slots stay reserved).
 */
export const STEER_QUEUE_MAX_ENTRIES = 20;

// A drained follow-up is delivered or put back within one step; a reservation
// a crashed run never settled frees its slots after this.
const INFLIGHT_TTL_SECONDS = 10 * 60;

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

/**
 * The append outcome is unknown: the command failed, and so did taking the
 * entry back. The caller must not tell the client to send directly (the stored
 * copy could still start); retrying the append with the same entry id settles it.
 */
export class SteerQueueWriteUnknownError extends Error {
  constructor(cause: unknown) {
    super('The follow-up may or may not have been queued; retry with the same id', { cause });
    this.name = 'SteerQueueWriteUnknownError';
  }
}

/**
 * Entries waiting on the surface but bound to no run — put back after a failed
 * start, when the run they were queued behind has already ended. The next run
 * that finishes on the surface takes them.
 */
const UNBOUND = '*';

// Each list item is `<entry id>\t<operation it waits behind>\n<entry JSON>`, so
// the scripts can match ids and operations without parsing JSON.
const encode = (entry: SteerQueueEntry, behind: string) =>
  `${entry.id}\t${behind}\n${JSON.stringify(entry)}`;

/** Lua helpers shared by the scripts below. */
const LUA_HEADER = `
local function header(item)
  local nl = string.find(item, '\\n', 1, true)
  if not nl then return nil, nil end
  local head = string.sub(item, 1, nl - 1)
  local tab = string.find(head, '\\t', 1, true)
  if not tab then return nil, nil end
  return string.sub(head, 1, tab - 1), string.sub(head, tab + 1)
end
local function takes(item, op)
  local _, behind = header(item)
  return behind == op or behind == '${UNBOUND}'
end
`;

/**
 * Idempotent by entry id: a retried append of an id still queued answers the
 * current length, and of an id a drain already took answers -2, instead of
 * adding a copy. The bound counts in-flight (drained, unsettled) entries too.
 *
 * KEYS[1] = queue; KEYS[2] = taken ids; KEYS[3] = in-flight count;
 * ARGV[1] = entry id; ARGV[2] = item; ARGV[3] = ttl; ARGV[4] = max
 */
const APPEND_SCRIPT = `${LUA_HEADER}
if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then return -2 end
local items = redis.call('LRANGE', KEYS[1], 0, -1)
for _, item in ipairs(items) do
  local id = header(item)
  if id == ARGV[1] then return #items end
end
local inflight = tonumber(redis.call('GET', KEYS[3]) or '0')
if #items + inflight >= tonumber(ARGV[4]) then return -1 end
local length = redis.call('RPUSH', KEYS[1], ARGV[2])
redis.call('EXPIRE', KEYS[1], ARGV[3])
return length
`;

/** KEYS[1] = queue */
const LIST_SCRIPT = `return redis.call('LRANGE', KEYS[1], 0, -1)`;

/** Entries a run would take. KEYS[1] = queue; ARGV[1] = operation id */
const LENGTH_SCRIPT = `${LUA_HEADER}
local count = 0
for _, item in ipairs(redis.call('LRANGE', KEYS[1], 0, -1)) do
  if takes(item, ARGV[1]) then count = count + 1 end
end
return count
`;

/** KEYS[1] = queue; ARGV[1] = entry id. Returns 1 when this call removed it. */
const REMOVE_SCRIPT = `${LUA_HEADER}
for _, item in ipairs(redis.call('LRANGE', KEYS[1], 0, -1)) do
  local id = header(item)
  if id == ARGV[1] then return redis.call('LREM', KEYS[1], 1, item) end
end
return 0
`;

/**
 * Takes the entries a run owns in one step: those queued behind it, unbound
 * ones, and those behind a run confirmed ended (it finished while its own drain
 * could not reach Redis). Entries behind any other run stay — including one
 * that started after the caller looked. Taken ids are recorded so a retried
 * append of one is recognized.
 *
 * Their slots stay reserved in the in-flight count until the caller settles
 * or restores them.
 *
 * KEYS[1] = queue; KEYS[2] = taken ids; KEYS[3] = in-flight count;
 * ARGV[1] = operation id; ARGV[2] = ttl; ARGV[3] = in-flight ttl;
 * ARGV[4..] = runs confirmed ended
 */
const DRAIN_SCRIPT = `${LUA_HEADER}
local ended = {}
for i = 4, #ARGV do ended[ARGV[i]] = true end
local taken = {}
local kept = {}
for _, item in ipairs(redis.call('LRANGE', KEYS[1], 0, -1)) do
  local id, behind = header(item)
  if takes(item, ARGV[1]) or (behind and ended[behind]) then
    table.insert(taken, item)
    if id then redis.call('SADD', KEYS[2], id) end
  else
    table.insert(kept, item)
  end
end
if #taken == 0 then return taken end
redis.call('EXPIRE', KEYS[2], ARGV[2])
redis.call('INCRBY', KEYS[3], #taken)
redis.call('EXPIRE', KEYS[3], ARGV[3])
local ttl = redis.call('TTL', KEYS[1])
redis.call('DEL', KEYS[1])
if #kept > 0 then
  redis.call('RPUSH', KEYS[1], unpack(kept))
  if ttl > 0 then redis.call('EXPIRE', KEYS[1], ttl) end
end
return taken
`;

/** Releases in-flight slots, never below zero. KEYS[1] = in-flight count; ARGV[1] = n */
const LUA_RELEASE = `
local function release(key, n)
  if n <= 0 then return end
  if redis.call('DECRBY', key, n) <= 0 then redis.call('DEL', key) end
end
`;

/**
 * Puts entries back at the head, in order, into the slots their drain
 * reserved — so the queue stays within its bound and nothing accepted since
 * is ever dropped — and releases those reservations.
 *
 * KEYS[1] = queue; KEYS[2] = in-flight count; ARGV[1] = ttl; ARGV[2..] = items
 */
const RESTORE_SCRIPT = `${LUA_RELEASE}
for i = #ARGV, 2, -1 do
  redis.call('LPUSH', KEYS[1], ARGV[i])
end
redis.call('EXPIRE', KEYS[1], ARGV[1])
release(KEYS[2], #ARGV - 1)
return redis.call('LLEN', KEYS[1])
`;

/** Drained entries were delivered or dropped: free their slots. KEYS[1] = in-flight; ARGV[1] = n */
const SETTLE_SCRIPT = `${LUA_RELEASE}
release(KEYS[1], tonumber(ARGV[1]))
return 1
`;

const keyOf = (scope: SteerQueueScope) =>
  RedisKeys.agentSteer.followUps(scope.userId, scope.topicId, scope.threadId);

const takenKeyOf = (scope: SteerQueueScope) =>
  RedisKeys.agentSteer.takenFollowUps(scope.userId, scope.topicId, scope.threadId);

const inflightKeyOf = (scope: SteerQueueScope) =>
  RedisKeys.agentSteer.inflightFollowUps(scope.userId, scope.topicId, scope.threadId);

/** The operation an item waits behind, from its header. */
const behindOf = (item: string) => {
  const head = item.slice(0, Math.max(item.indexOf('\n'), 0));
  const tab = head.indexOf('\t');
  return tab < 0 ? undefined : head.slice(tab + 1);
};

const parseEntries = <T extends SteerQueueEntry>(raw: unknown): T[] => {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (typeof item !== 'string') return [];
    const nl = item.indexOf('\n');
    if (nl < 0) return [];
    try {
      return [JSON.parse(item.slice(nl + 1)) as T];
    } catch {
      return [];
    }
  });
};

/**
 * Follow-ups a user queued behind a running turn, held server-side so the
 * runtime can start the next turn without a round trip through the client.
 * Each entry is bound to the run it was queued behind, and only that run (or,
 * once put back after a failed start, the next run on the surface) takes it.
 *
 * `append` returns `undefined` when the follow-up was definitely not stored: the
 * caller then tells the client to send the message itself, as it did before
 * this queue. `restore` rejects instead — the entries it carries are already
 * out of the queue, so its caller must know they could not go back.
 */
export const steerQueue = {
  /**
   * Adds an entry at the tail, waiting behind `operationId`. Retrying with an
   * entry id that is already queued is a no-op.
   *
   * @returns the queue length, `'full'` at {@link STEER_QUEUE_MAX_ENTRIES},
   * `'taken'` when a drain already took this entry id (a retry of a write that
   * landed), or `undefined` when it was not stored (no Redis, or a failed
   * command that was taken back)
   * @throws {SteerQueueWriteUnknownError} when the command failed and taking
   * the entry back did not prove it absent (the take-back failed, or found
   * nothing because a drain may already have taken it)
   */
  async append(scope: SteerQueueScope, entry: SteerQueueEntry, operationId: string) {
    const redis = await getClient();
    if (!redis) return;

    const key = keyOf(scope);
    try {
      const length = await redis.eval<number>(
        APPEND_SCRIPT,
        3,
        key,
        takenKeyOf(scope),
        inflightKeyOf(scope),
        entry.id,
        encode(entry, operationId),
        QUEUE_TTL_SECONDS,
        STEER_QUEUE_MAX_ENTRIES,
      );
      if (Number(length) === -2) return 'taken' as const;
      return Number(length) < 0 ? ('full' as const) : Number(length);
    } catch (error) {
      // A timed-out command may still have committed. Take the entry back
      // through the same client (a fresh one is behind the open circuit) so
      // "not stored" holds before the client is told to send directly.
      let removed: number;
      try {
        removed = Number(await redis.eval<number>(REMOVE_SCRIPT, 1, key, entry.id));
      } catch {
        throw new SteerQueueWriteUnknownError(error);
      }
      // Nothing to take back: the write never landed, or a drain already took
      // it and may be starting it. Only a removal proves "not stored".
      if (removed === 0) throw new SteerQueueWriteUnknownError(error);
      return;
    }
  },

  /**
   * Takes the entries `operationId` owns — queued behind it, unbound, or
   * behind one of `endedOperationIds` (runs the caller confirmed ended) —
   * oldest first. Entries behind any other run stay queued.
   *
   * @throws when Redis is unavailable — an outage is not an empty queue; the
   * entries stay, and a later run on the surface takes them
   */
  async drain<T extends SteerQueueEntry>(
    scope: SteerQueueScope,
    operationId: string,
    endedOperationIds: string[],
  ): Promise<T[]> {
    const redis = await getClient();
    if (!redis) throw new Error('Redis is unavailable to drain queued follow-ups');

    return parseEntries<T>(
      await redis.eval<unknown>(
        DRAIN_SCRIPT,
        3,
        keyOf(scope),
        takenKeyOf(scope),
        inflightKeyOf(scope),
        operationId,
        QUEUE_TTL_SECONDS,
        INFLIGHT_TTL_SECONDS,
        ...endedOperationIds,
      ),
    );
  },

  /**
   * The runs the waiting entries are bound to (unbound ones excluded), so a
   * caller can tell which of them ended. Empty when nothing is queued.
   *
   * @throws when Redis is unavailable, like {@link steerQueue.drain}
   */
  async boundOperations(
    scope: SteerQueueScope,
  ): Promise<{ operationIds: string[]; total: number }> {
    const redis = await getClient();
    if (!redis) throw new Error('Redis is unavailable to read queued follow-ups');

    const raw = await redis.eval<unknown>(LIST_SCRIPT, 1, keyOf(scope));
    const items = Array.isArray(raw)
      ? raw.filter((item): item is string => typeof item === 'string')
      : [];
    const operationIds = new Set<string>();
    for (const item of items) {
      const behind = behindOf(item);
      if (behind && behind !== UNBOUND) operationIds.add(behind);
    }
    return { operationIds: [...operationIds], total: items.length };
  },

  /** Number of entries `operationId` would take; `0` without Redis. */
  async length(scope: SteerQueueScope, operationId: string): Promise<number> {
    const redis = await getClient();
    if (!redis) return 0;

    return Number(await redis.eval<number>(LENGTH_SCRIPT, 1, keyOf(scope), operationId));
  },

  /** Every waiting entry on the surface, oldest first. */
  async list<T extends SteerQueueEntry>(scope: SteerQueueScope): Promise<T[]> {
    const redis = await getClient();
    if (!redis) return [];

    return parseEntries<T>(await redis.eval<unknown>(LIST_SCRIPT, 1, keyOf(scope)));
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

    return Number(await redis.eval<number>(REMOVE_SCRIPT, 1, keyOf(scope), id)) > 0;
  },

  /**
   * Puts drained entries back at the head, ahead of anything queued since,
   * unbound — the run they waited behind has ended, so the next run that
   * finishes on the surface takes them. They return into the slots their
   * drain reserved, so nothing accepted meanwhile is dropped. Rejects when
   * Redis is unavailable: the entries are out of the queue already.
   */
  async restore(scope: SteerQueueScope, entries: SteerQueueEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const redis = await getClient();
    if (!redis) throw new Error('Redis is unavailable to restore queued follow-ups');

    await redis.eval(
      RESTORE_SCRIPT,
      2,
      keyOf(scope),
      inflightKeyOf(scope),
      QUEUE_TTL_SECONDS,
      ...entries.map((entry) => encode(entry, UNBOUND)),
    );
  },

  /**
   * Drained entries reached their destination (or were dropped): release the
   * slots their drain reserved. Best effort — an unreleased reservation lapses
   * on its own.
   */
  async settle(scope: SteerQueueScope, count: number): Promise<void> {
    if (count <= 0) return;

    const redis = await getClient();
    if (!redis) return;

    await redis.eval(SETTLE_SCRIPT, 1, inflightKeyOf(scope), count);
  },
};
