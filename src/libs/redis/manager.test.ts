import { afterEach, describe, expect, it, vi } from 'vitest';

import { RedisManager, initializeRedis, resetRedisClient } from './manager';
import { DisabledRedisConfig } from './types';

const {
  mockIoRedisInitialize,
  mockIoRedisDisconnect,
  mockUpstashInitialize,
  mockUpstashDisconnect,
} = vi.hoisted(() => ({
  mockIoRedisInitialize: vi.fn().mockResolvedValue(undefined),
  mockIoRedisDisconnect: vi.fn().mockResolvedValue(undefined),
  mockUpstashInitialize: vi.fn().mockResolvedValue(undefined),
  mockUpstashDisconnect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./redis', () => {
  const IoRedisRedisProvider = vi.fn().mockImplementation((config) => ({
    provider: 'redis' as const,
    config,
    initialize: mockIoRedisInitialize,
    disconnect: mockIoRedisDisconnect,
  }));

  return { IoRedisRedisProvider };
});

vi.mock('./upstash', () => {
  const UpstashRedisProvider = vi.fn().mockImplementation((config) => ({
    provider: 'upstash' as const,
    config,
    initialize: mockUpstashInitialize,
    disconnect: mockUpstashDisconnect,
  }));

  return { UpstashRedisProvider };
});

afterEach(async () => {
  vi.clearAllMocks();
  await RedisManager.reset();
});

describe('RedisManager', () => {
  it('returns null when redis is disabled', async () => {
    const config = {
      enabled: false,
      prefix: 'test',
      provider: false,
    } satisfies DisabledRedisConfig;

    const instance = await initializeRedis(config);

    expect(instance).toBeNull();
    expect(mockIoRedisInitialize).not.toHaveBeenCalled();
    expect(mockUpstashInitialize).not.toHaveBeenCalled();
  });

  it('initializes ioredis provider once and memoizes the instance', async () => {
    const config = {
      database: 0,
      enabled: true,
      password: 'pwd',
      prefix: 'test',
      provider: 'redis' as const,
      tls: false,
      url: 'redis://localhost:6379',
      username: 'user',
    };
    const [first, second] = await Promise.all([initializeRedis(config), initializeRedis(config)]);

    expect(first).toBe(second);
    expect(mockIoRedisInitialize).toHaveBeenCalledTimes(1);
    expect(mockUpstashInitialize).not.toHaveBeenCalled();
  });

  it('initializes upstash provider when configured', async () => {
    const config = {
      enabled: true,
      prefix: 'test',
      provider: 'upstash' as const,
      token: 'token',
      url: 'https://example.upstash.io',
    };
    const instance = await initializeRedis(config);

    expect(instance?.provider).toBe('upstash');
    expect(mockUpstashInitialize).toHaveBeenCalledTimes(1);
    expect(mockIoRedisInitialize).not.toHaveBeenCalled();
  });

  it('disconnects existing provider on reset', async () => {
    const config = {
      enabled: true,
      prefix: 'test',
      provider: 'redis' as const,
      tls: false,
      url: 'redis://localhost:6379',
    };

    await initializeRedis(config);
    await resetRedisClient();

    expect(mockIoRedisDisconnect).toHaveBeenCalledTimes(1);
  });
});
