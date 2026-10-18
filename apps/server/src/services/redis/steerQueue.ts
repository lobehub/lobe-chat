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
 * Idempotent by entry id: a retried append of an id already queued answers the
 * current length instead of adding a copy.
 *
 * KEYS[1] = queue; ARGV[1] = entry id; ARGV[2] = item; ARGV[3] = ttl; ARGV[4] = max
 */
const APPEND_SCRIPT = `${LUA_HEADER}
local items = redis.call('LRANGE', KEYS[1], 0, -1)
for _, item in ipairs(items) do
  local id = header(item)
  if id == ARGV[1] then return #items end
end
if #items >= tonumber(ARGV[4]) then return -1 end
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
 * Takes the entries a finishing run owns — those queued behind it, and unbound
 * ones — in one step, leaving entries queued behind another live run in place.
 *
 * KEYS[1] = queue; ARGV[1] = operation id
 */
const DRAIN_SCRIPT = `${LUA_HEADER}
local taken = {}
local kept = {}
for _, item in ipairs(redis.call('LRANGE', KEYS[1], 0, -1)) do
  if takes(item, ARGV[1]) then table.insert(taken, item) else table.insert(kept, item) end
end
if #taken == 0 then return taken end
local ttl = redis.call('TTL', KEYS[1])
redis.call('DEL', KEYS[1])
if #kept > 0 then
  redis.call('RPUSH', KEYS[1], unpack(kept))
  if ttl > 0 then redis.call('EXPIRE', KEYS[1], ttl) end
end
return taken
`;

/**
 * Puts entries back at the head, in order, then holds the queue to its bound:
 * entries queued since the drain may have filled it again, and the overflow
 * (the newest, at the tail) is dropped and counted.
 *
 * KEYS[1] = queue; ARGV[1] = ttl; ARGV[2] = max entries; ARGV[3..] = items
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
   * @returns the queue length, `'full'` at {@link STEER_QUEUE_MAX_ENTRIES}, or
   * `undefined` when it was not stored (no Redis, or a failed command that was
   * taken back)
   * @throws {SteerQueueWriteUnknownError} when the command failed and taking
   * the entry back failed too
   */
  async append(scope: SteerQueueScope, entry: SteerQueueEntry, operationId: string) {
    const redis = await getClient();
    if (!redis) return;

    const key = keyOf(scope);
    try {
      const length = await redis.eval<number>(
        APPEND_SCRIPT,
        1,
        key,
        entry.id,
        encode(entry, operationId),
        QUEUE_TTL_SECONDS,
        STEER_QUEUE_MAX_ENTRIES,
      );
      return Number(length) < 0 ? ('full' as const) : Number(length);
    } catch (error) {
      // A timed-out command may still have committed. Take the entry back
      // through the same client (a fresh one is behind the open circuit) so
      // "not stored" holds before the client is told to send directly.
      try {
        await redis.eval(REMOVE_SCRIPT, 1, key, entry.id);
      } catch {
        throw new SteerQueueWriteUnknownError(error);
      }
      return;
    }
  },

  /**
   * Takes the entries `operationId` owns — queued behind it, or unbound —
   * oldest first. Entries behind another run stay queued.
   */
  async drain<T extends SteerQueueEntry>(
    scope: SteerQueueScope,
    operationId: string,
  ): Promise<T[]> {
    const redis = await getClient();
    if (!redis) return [];

    return parseEntries<T>(await redis.eval<unknown>(DRAIN_SCRIPT, 1, keyOf(scope), operationId));
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
   * finishes on the surface takes them. Keeps the queue within
   * {@link STEER_QUEUE_MAX_ENTRIES}. Rejects when Redis is unavailable: the
   * entries are out of the queue already.
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
      ...entries.map((entry) => encode(entry, UNBOUND)),
    );
    return Number(dropped) || 0;
  },
};
