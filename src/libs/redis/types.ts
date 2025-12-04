export type RedisKey = string | Buffer;
export type RedisValue = string | Buffer | number;
export type RedisProvider = false | 'redis' | 'upstash';
export type RedisProviderName = Exclude<RedisProvider, false>;

export type IoRedisConfig = {
  database?: number;
  enabled: boolean;
  password?: string;
  prefix: string;
  provider: 'redis';
  tls: boolean;
  url: string;
  username?: string;
};

export type UpstashConfig = {
  enabled: boolean;
  prefix: string;
  provider: 'upstash';
  token: string;
  url: string;
};

export type DisabledRedisConfig = {
  enabled: false;
  prefix: string;
  provider: false;
};

export type RedisConfig = IoRedisConfig | UpstashConfig | DisabledRedisConfig;

export interface SetOptions {
  ex?: number;
  exat?: number;
  get?: boolean;
  keepTtl?: boolean;
  nx?: boolean;
  px?: number;
  pxat?: number;
  xx?: boolean;
}

// NOTICE: number comes from upstash
export type RedisSetResult = 'OK' | null | string | number;
export type RedisMSetArgument = Record<string, RedisValue> | Map<RedisKey, RedisValue>;

export interface RedisClient {
  decr(key: RedisKey): Promise<number>;
  del(...keys: RedisKey[]): Promise<number>;
  exists(...keys: RedisKey[]): Promise<number>;
  expire(key: RedisKey, seconds: number): Promise<number>;
  get(key: RedisKey): Promise<string | null>;
  hdel(key: RedisKey, ...fields: RedisKey[]): Promise<number>;
  hget(key: RedisKey, field: RedisKey): Promise<string | null>;
  hgetall(key: RedisKey): Promise<Record<string, string>>;
  hset(key: RedisKey, field: RedisKey, value: RedisValue): Promise<number>;
  incr(key: RedisKey): Promise<number>;
  mget(...keys: RedisKey[]): Promise<(string | null)[]>;
  mset(values: RedisMSetArgument): Promise<'OK'>;
  set(key: RedisKey, value: RedisValue, options?: SetOptions): Promise<RedisSetResult>;
  setex(key: RedisKey, seconds: number, value: RedisValue): Promise<'OK'>;
  ttl(key: RedisKey): Promise<number>;
}

export interface BaseRedisProvider extends RedisClient {
  disconnect(): Promise<void>;

  initialize(): Promise<void>;
  provider: RedisProviderName;
}
