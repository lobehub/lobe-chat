import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redisService } from './index';
import { STEER_QUEUE_MAX_ENTRIES, SteerQueueWriteUnknownError } from './steerQueue';

const getRedisServiceClient = vi.hoisted(() => vi.fn());
vi.mock('./client', () => ({ getRedisServiceClient }));

/**
 * Emulates the queue's Lua scripts over an in-memory list store, reading each
 * item's `<id>\t<behind>\n<json>` header the way the scripts do. The scripts
 * themselves run against a real Redis in the PR's verification.
 */
const createFakeRedis = () => {
  const lists = new Map<string, string[]>();
  const ttls = new Map<string, number>();
  const listOf = (key: string) => lists.get(key) ?? [];
  const header = (item: string) => {
    const [id, behind] = item.slice(0, item.indexOf('\n')).split('\t');
    return { behind, id };
  };
  const takes = (item: string, op: string) => ['*', op].includes(header(item).behind);

  const taken = new Map<string, Set<string>>();
  const takenOf = (key: string) => {
    if (!taken.has(key)) taken.set(key, new Set());
    return taken.get(key)!;
  };

  const inflight = new Map<string, number>();
  const release = (k: string, n: number) =>
    inflight.set(k, Math.max((inflight.get(k) ?? 0) - n, 0));

  const evalScript = vi.fn(async (script: string, numKeys: number, ...rest: any[]) => {
    const [key, takenKey, inflightKey] = rest;
    const args = rest.slice(numKeys);
    const list = listOf(key);
    if (script.includes('local taken')) {
      const [op, _ttl, _inflightTtl, ...ended] = args;
      const owned = (item: string) => takes(item, op) || ended.includes(header(item).behind);
      for (const item of list.filter(owned)) takenOf(takenKey).add(header(item).id);
      inflight.set(inflightKey, (inflight.get(inflightKey) ?? 0) + list.filter(owned).length);
      lists.set(
        key,
        list.filter((item) => !owned(item)),
      );
      return list.filter(owned);
    }
    if (script.includes('local count')) return list.filter((item) => takes(item, args[0])).length;
    if (script.includes('LPUSH')) {
      // restore: KEYS = queue, in-flight
      const [ttl, ...items] = args;
      lists.set(key, [...items, ...list]);
      ttls.set(key, Number(ttl));
      release(takenKey, items.length);
      return items.length + list.length;
    }
    if (script.includes('release(KEYS[1]')) {
      release(key, Number(args[0]));
      return 1;
    }
    if (script.includes('LREM')) {
      const index = list.findIndex((item) => header(item).id === args[0]);
      if (index < 0) return 0;
      lists.set(key, list.toSpliced(index, 1));
      return 1;
    }
    if (script.includes('RPUSH')) {
      const [id, item, ttl, max] = args;
      if (takenOf(takenKey).has(id)) return -2;
      if (list.some((existing) => header(existing).id === id)) return list.length;
      if (list.length + (inflight.get(inflightKey) ?? 0) >= Number(max)) return -1;
      lists.set(key, [...list, item]);
      ttls.set(key, Number(ttl));
      return list.length + 1;
    }
    if (script.includes('LRANGE')) return list;
    throw new Error(`unexpected script: ${script}`);
  });

  return { client: { eval: evalScript }, inflight, lists, ttls };
};

const scope = { topicId: 'tpc-1', userId: 'u1' };
const entry = (id: string, createdAt = 1) => ({ createdAt, id, prompt: id });
const ids = async (s = scope) => (await redisService.steerQueue.list(s)).map((item) => item.id);

describe('redisService.steerQueue', () => {
  let redis: ReturnType<typeof createFakeRedis>;

  beforeEach(() => {
    redis = createFakeRedis();
    getRedisServiceClient.mockReset();
    getRedisServiceClient.mockImplementation(async () => redis.client);
  });

  it('keeps one queue per user and conversation surface under the agentSteer scope', async () => {
    await redisService.steerQueue.append(scope, entry('a'), 'op-1');
    await redisService.steerQueue.append({ ...scope, threadId: 'thd-1' }, entry('b'), 'op-2');
    await redisService.steerQueue.append({ ...scope, userId: 'u2' }, entry('c'), 'op-3');

    expect(getRedisServiceClient).toHaveBeenCalledWith('agentSteer');
    expect([...redis.lists.keys()]).toEqual([
      'follow_ups:v1:u1:tpc-1:main',
      'follow_ups:v1:u1:tpc-1:thd-1',
      'follow_ups:v1:u2:tpc-1:main',
    ]);
    expect(redis.ttls.get('follow_ups:v1:u1:tpc-1:main')).toBe(24 * 60 * 60);
  });

  it('drains what was queued behind the finishing run exactly once, in order', async () => {
    await redisService.steerQueue.append(scope, entry('a'), 'op-1');
    await redisService.steerQueue.append(scope, entry('b'), 'op-1');

    await expect(redisService.steerQueue.drain(scope, 'op-1', [])).resolves.toEqual([
      entry('a'),
      entry('b'),
    ]);
    await expect(redisService.steerQueue.drain(scope, 'op-1', [])).resolves.toEqual([]);
    await expect(redisService.steerQueue.length(scope, 'op-1')).resolves.toBe(0);
  });

  it('leaves follow-ups queued behind another live run on the surface to that run', async () => {
    await redisService.steerQueue.append(scope, entry('behind-1'), 'op-1');
    await redisService.steerQueue.append(scope, entry('behind-2'), 'op-2');

    await expect(redisService.steerQueue.length(scope, 'op-1')).resolves.toBe(1);
    await expect(redisService.steerQueue.drain(scope, 'op-1', [])).resolves.toEqual([
      entry('behind-1'),
    ]);
    expect(await ids()).toEqual(['behind-2']);
    await expect(redisService.steerQueue.drain(scope, 'op-2', [])).resolves.toEqual([
      entry('behind-2'),
    ]);
  });

  it('hands restored follow-ups to the next run that finishes on the surface', async () => {
    await redisService.steerQueue.append(scope, entry('a'), 'op-1');
    await redisService.steerQueue.append(scope, entry('b'), 'op-1');
    const drained = await redisService.steerQueue.drain(scope, 'op-1', []);
    await redisService.steerQueue.append(scope, entry('c'), 'op-2');

    await redisService.steerQueue.restore(scope, drained);

    expect(await ids()).toEqual(['a', 'b', 'c']);
    await expect(redisService.steerQueue.length(scope, 'op-2')).resolves.toBe(3);
    await expect(redisService.steerQueue.drain(scope, 'op-2', [])).resolves.toHaveLength(3);
  });

  it('appends an entry id at most once, so a retry never duplicates the follow-up', async () => {
    await expect(redisService.steerQueue.append(scope, entry('a'), 'op-1')).resolves.toBe(1);
    await expect(redisService.steerQueue.append(scope, entry('a'), 'op-1')).resolves.toBe(1);

    expect(await ids()).toEqual(['a']);
  });

  it('removes one entry by id and reports a miss once it is gone', async () => {
    await redisService.steerQueue.append(scope, entry('a'), 'op-1');
    await redisService.steerQueue.append(scope, entry('b'), 'op-1');

    await expect(redisService.steerQueue.remove(scope, 'a')).resolves.toBe(true);
    await expect(redisService.steerQueue.remove(scope, 'a')).resolves.toBe(false);
    expect(await ids()).toEqual(['b']);
  });

  it('refuses entries past the bound', async () => {
    for (let i = 0; i < STEER_QUEUE_MAX_ENTRIES; i++) {
      await redisService.steerQueue.append(scope, entry(`m${i}`), 'op-1');
    }

    await expect(redisService.steerQueue.append(scope, entry('over'), 'op-1')).resolves.toBe(
      'full',
    );
    await expect(redisService.steerQueue.length(scope, 'op-1')).resolves.toBe(
      STEER_QUEUE_MAX_ENTRIES,
    );
  });

  it('reports no Redis so the caller can fall back to a direct send', async () => {
    getRedisServiceClient.mockResolvedValue(null);

    await expect(
      redisService.steerQueue.append(scope, entry('a'), 'op-1'),
    ).resolves.toBeUndefined();
    await expect(redisService.steerQueue.length(scope, 'op-1')).resolves.toBe(0);
    // An outage is not an empty queue: the drain says so, and the entries stay.
    await expect(redisService.steerQueue.drain(scope, 'op-1', [])).rejects.toThrow(
      'Redis is unavailable',
    );
    await expect(redisService.steerQueue.boundOperations(scope)).rejects.toThrow(
      'Redis is unavailable',
    );
  });

  it('lets the next run take follow-ups behind a run confirmed ended, and only those', async () => {
    await redisService.steerQueue.append(scope, entry('orphan'), 'op-ended');
    await redisService.steerQueue.append(scope, entry('behind-live'), 'op-live');

    await expect(redisService.steerQueue.boundOperations(scope)).resolves.toEqual({
      operationIds: ['op-ended', 'op-live'],
      total: 2,
    });
    await expect(redisService.steerQueue.drain(scope, 'op-next', ['op-ended'])).resolves.toEqual([
      entry('orphan'),
    ]);
    expect(await ids()).toEqual(['behind-live']);
  });

  it('reports an unknown outcome when the take-back finds nothing to remove', async () => {
    // The write never landed — or a drain took it first and may be starting it.
    redis.client.eval.mockRejectedValueOnce(new Error('command timed out'));

    await expect(redisService.steerQueue.append(scope, entry('a'), 'op-1')).rejects.toBeInstanceOf(
      SteerQueueWriteUnknownError,
    );
  });

  it('takes back an append that committed before its command failed, then falls back', async () => {
    const run = redis.client.eval.getMockImplementation()!;
    redis.client.eval.mockImplementationOnce(async (...args: any[]) => {
      await run(...(args as [string, number, string]));
      throw new Error('command timed out');
    });

    await expect(
      redisService.steerQueue.append(scope, entry('a'), 'op-1'),
    ).resolves.toBeUndefined();

    expect(await ids()).toEqual([]);
  });

  it('reports an unknown outcome when the take-back fails too', async () => {
    redis.client.eval
      .mockRejectedValueOnce(new Error('command timed out'))
      .mockRejectedValueOnce(new Error('connection lost'));

    await expect(redisService.steerQueue.append(scope, entry('a'), 'op-1')).rejects.toBeInstanceOf(
      SteerQueueWriteUnknownError,
    );
  });

  it('rejects a restore it cannot write, so drained entries are never dropped silently', async () => {
    getRedisServiceClient.mockResolvedValue(null);

    await expect(redisService.steerQueue.restore(scope, [entry('a')])).rejects.toThrow(
      'Redis is unavailable',
    );
  });

  it('keeps each user’s follow-ups out of another user’s drain on the same surface', async () => {
    await redisService.steerQueue.append(scope, entry('mine'), 'op-1');
    await redisService.steerQueue.append({ ...scope, userId: 'u2' }, entry('theirs'), 'op-1');

    await expect(redisService.steerQueue.drain(scope, 'op-1', [])).resolves.toEqual([
      entry('mine'),
    ]);
    expect(await ids({ ...scope, userId: 'u2' })).toEqual(['theirs']);
  });

  it('reserves drained slots, so a restore never drops what was accepted meanwhile', async () => {
    await redisService.steerQueue.append(scope, entry('old-1'), 'op-1');
    await redisService.steerQueue.append(scope, entry('old-2'), 'op-1');
    const drained = await redisService.steerQueue.drain(scope, 'op-1', []);
    // Two slots stay reserved for the drained pair: only 18 new ones fit.
    for (let i = 0; i < STEER_QUEUE_MAX_ENTRIES - 2; i++) {
      await expect(redisService.steerQueue.append(scope, entry(`new-${i}`), 'op-2')).resolves.toBe(
        i + 1,
      );
    }
    await expect(redisService.steerQueue.append(scope, entry('over'), 'op-2')).resolves.toBe(
      'full',
    );

    await redisService.steerQueue.restore(scope, drained);

    const queued = await ids();
    expect(queued).toHaveLength(STEER_QUEUE_MAX_ENTRIES);
    expect(queued.slice(0, 3)).toEqual(['old-1', 'old-2', 'new-0']);
    expect(queued.at(-1)).toBe(`new-${STEER_QUEUE_MAX_ENTRIES - 3}`);
  });

  it('frees the reserved slots once the drained entries are delivered', async () => {
    await redisService.steerQueue.append(scope, entry('a'), 'op-1');
    await redisService.steerQueue.drain(scope, 'op-1', []);
    expect(redis.inflight.get('follow_ups_inflight:v1:u1:tpc-1:main')).toBe(1);

    await redisService.steerQueue.settle(scope, 1);

    expect(redis.inflight.get('follow_ups_inflight:v1:u1:tpc-1:main')).toBe(0);
  });

  it('recognizes a retry of an entry its run already took, instead of queueing it again', async () => {
    await redisService.steerQueue.append(scope, entry('a'), 'op-1');
    await redisService.steerQueue.drain(scope, 'op-1', []);

    await expect(redisService.steerQueue.append(scope, entry('a'), 'op-2')).resolves.toBe('taken');
    expect(await ids()).toEqual([]);
  });
});
