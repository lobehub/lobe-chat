import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redisService } from './index';
import { STEER_QUEUE_MAX_ENTRIES } from './steerQueue';

const getRedisServiceClient = vi.hoisted(() => vi.fn());
vi.mock('./client', () => ({ getRedisServiceClient }));

/** Runs the queue's Lua scripts against an in-memory list store. */
const createFakeRedis = () => {
  const lists = new Map<string, string[]>();
  const ttls = new Map<string, number>();
  const listOf = (key: string) => lists.get(key) ?? [];

  const evalScript = vi.fn(
    async (script: string, _numKeys: number, key: string, ...args: any[]) => {
      const list = listOf(key);
      if (script.includes('RPUSH')) {
        const [entry, ttl, max] = args;
        if (list.length >= Number(max)) return -1;
        lists.set(key, [...list, entry]);
        ttls.set(key, Number(ttl));
        return list.length + 1;
      }
      if (script.includes('LPUSH')) {
        const [ttl, ...entries] = args;
        lists.set(key, [...entries, ...list]);
        ttls.set(key, Number(ttl));
        return entries.length + list.length;
      }
      if (script.includes('DEL')) {
        lists.delete(key);
        return list;
      }
      if (script.includes('LREM')) {
        const index = list.indexOf(args[0]);
        if (index < 0) return 0;
        lists.set(key, list.toSpliced(index, 1));
        return 1;
      }
      if (script.includes('LLEN')) return list.length;
      if (script.includes('LRANGE')) return list;
      throw new Error(`unexpected script: ${script}`);
    },
  );

  return { client: { eval: evalScript }, lists, ttls };
};

const scope = { topicId: 'tpc-1' };
const entry = (id: string, createdAt = 1) => ({ createdAt, id, prompt: id });

describe('redisService.steerQueue', () => {
  let redis: ReturnType<typeof createFakeRedis>;

  beforeEach(() => {
    redis = createFakeRedis();
    getRedisServiceClient.mockReset();
    getRedisServiceClient.mockImplementation(async () => redis.client);
  });

  it('keeps one queue per conversation surface under the agentSteer scope', async () => {
    await redisService.steerQueue.append(scope, entry('a'));
    await redisService.steerQueue.append({ threadId: 'thd-1', topicId: 'tpc-1' }, entry('b'));

    expect(getRedisServiceClient).toHaveBeenCalledWith('agentSteer');
    expect([...redis.lists.keys()]).toEqual([
      'follow_ups:v1:tpc-1:main',
      'follow_ups:v1:tpc-1:thd-1',
    ]);
    expect(redis.ttls.get('follow_ups:v1:tpc-1:main')).toBe(24 * 60 * 60);
  });

  it('drains every entry in queue order exactly once', async () => {
    await redisService.steerQueue.append(scope, entry('a'));
    await redisService.steerQueue.append(scope, entry('b'));

    await expect(redisService.steerQueue.drain(scope)).resolves.toEqual([entry('a'), entry('b')]);
    await expect(redisService.steerQueue.drain(scope)).resolves.toEqual([]);
    await expect(redisService.steerQueue.length(scope)).resolves.toBe(0);
  });

  it('puts restored entries back ahead of anything queued since the drain', async () => {
    await redisService.steerQueue.append(scope, entry('a'));
    await redisService.steerQueue.append(scope, entry('b'));
    const drained = await redisService.steerQueue.drain(scope);
    await redisService.steerQueue.append(scope, entry('c'));

    await redisService.steerQueue.restore(scope, drained);

    const ids = (await redisService.steerQueue.list(scope)).map((item) => item.id);
    expect(ids).toEqual(['a', 'b', 'c']);
  });

  it('removes one entry by id and reports a miss once it is gone', async () => {
    await redisService.steerQueue.append(scope, entry('a'));
    await redisService.steerQueue.append(scope, entry('b'));

    await expect(redisService.steerQueue.remove(scope, 'a')).resolves.toBe(true);
    await expect(redisService.steerQueue.remove(scope, 'a')).resolves.toBe(false);
    expect((await redisService.steerQueue.list(scope)).map((item) => item.id)).toEqual(['b']);
  });

  it('refuses entries past the bound', async () => {
    for (let i = 0; i < STEER_QUEUE_MAX_ENTRIES; i++) {
      await redisService.steerQueue.append(scope, entry(`m${i}`));
    }

    await expect(redisService.steerQueue.append(scope, entry('over'))).resolves.toBe('full');
    await expect(redisService.steerQueue.length(scope)).resolves.toBe(STEER_QUEUE_MAX_ENTRIES);
  });

  it('reports no Redis so the caller can fall back to a direct send', async () => {
    getRedisServiceClient.mockResolvedValue(null);

    await expect(redisService.steerQueue.append(scope, entry('a'))).resolves.toBeUndefined();
    await expect(redisService.steerQueue.drain(scope)).resolves.toEqual([]);
    await expect(redisService.steerQueue.length(scope)).resolves.toBe(0);
  });
});
