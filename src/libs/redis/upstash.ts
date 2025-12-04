import { Redis, RedisConfigNodejs } from '@upstash/redis';
import { Buffer } from 'node:buffer';

import {
  BaseRedisProvider,
  RedisKey,
  RedisMSetArgument,
  RedisSetResult,
  RedisValue,
  SetOptions,
  UpstashConfig,
} from './types';
import {
  buildUpstashSetOptions,
  normalizeMsetValues,
  normalizeRedisKey,
  normalizeRedisKeys,
} from './utils';

export class UpstashRedisProvider implements BaseRedisProvider {
  provider: 'upstash' = 'upstash';
  private client: Redis;

  constructor(options: UpstashConfig | RedisConfigNodejs) {
    this.client = new Redis(options as RedisConfigNodejs);
  }

  async initialize(): Promise<void> {
    await this.client.ping();
  }

  async disconnect() {
    // upstash client is stateless http, nothing to disconnect
  }

  async get(key: RedisKey): Promise<string | null> {
    return this.client.get(normalizeRedisKey(key));
  }

  async set(key: RedisKey, value: RedisValue, options?: SetOptions): Promise<RedisSetResult> {
    const res = await this.client.set(
      normalizeRedisKey(key),
      value,
      buildUpstashSetOptions(options),
    );
    if (Buffer.isBuffer(res)) {
      return res.toString();
    }

    return res;
  }

  async setex(key: RedisKey, seconds: number, value: RedisValue): Promise<'OK'> {
    return this.client.setex(normalizeRedisKey(key), seconds, value);
  }

  async del(...keys: RedisKey[]): Promise<number> {
    return this.client.del(...normalizeRedisKeys(keys));
  }

  async exists(...keys: RedisKey[]): Promise<number> {
    return this.client.exists(...normalizeRedisKeys(keys));
  }

  async expire(key: RedisKey, seconds: number): Promise<number> {
    return this.client.expire(normalizeRedisKey(key), seconds);
  }

  async ttl(key: RedisKey): Promise<number> {
    return this.client.ttl(normalizeRedisKey(key));
  }

  async incr(key: RedisKey): Promise<number> {
    return this.client.incr(normalizeRedisKey(key));
  }

  async decr(key: RedisKey): Promise<number> {
    return this.client.decr(normalizeRedisKey(key));
  }

  async mget(...keys: RedisKey[]): Promise<(string | null)[]> {
    return this.client.mget(...normalizeRedisKeys(keys));
  }

  async mset(values: RedisMSetArgument): Promise<'OK'> {
    return this.client.mset(normalizeMsetValues(values));
  }

  async hget(key: RedisKey, field: RedisKey): Promise<string | null> {
    return this.client.hget(normalizeRedisKey(key), normalizeRedisKey(field));
  }

  async hset(key: RedisKey, field: RedisKey, value: RedisValue): Promise<number> {
    return this.client.hset(normalizeRedisKey(key), { [normalizeRedisKey(field)]: value });
  }

  async hdel(key: RedisKey, ...fields: RedisKey[]): Promise<number> {
    return this.client.hdel(normalizeRedisKey(key), ...normalizeRedisKeys(fields));
  }

  async hgetall(key: RedisKey): Promise<Record<string, string>> {
    const res = await this.client.hgetall(normalizeRedisKey(key));
    if (!res) {
      return {};
    }

    return res as Record<string, string>;
  }
}
