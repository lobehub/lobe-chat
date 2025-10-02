import debug from 'debug';
import Redis from 'ioredis';

import { getRedisConnectionDescription, getRedisUrl } from './config';

const log = debug('redis:client');

/**
 * 创建 Redis 客户端实例
 */
export const createRedisClient = (url?: string): Redis | null => {
  const redisUrl = url || getRedisUrl();

  if (!redisUrl) {
    console.warn('[Redis Client] No Redis URL available. Redis features are disabled.');
    return null;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });

  client.on('connect', () => {
    log(`Connected to Redis: ${getRedisConnectionDescription(redisUrl)}`);
  });

  client.on('error', (error) => {
    console.error('[Redis Client] Redis connection error:', error);
  });

  client.on('close', () => {
    log('Redis connection closed');
  });

  return client;
};

/**
 * 全局 Redis 客户端实例（单例模式）
 */
let globalRedisClient: Redis | null = null;
let redisInitialized = false;

/**
 * 获取全局 Redis 客户端实例
 */
export function getRedisClient(): Redis | null {
  if (!redisInitialized) {
    globalRedisClient = createRedisClient();
    redisInitialized = true;
  }
  return globalRedisClient;
}

/**
 * 关闭全局 Redis 客户端连接
 */
export async function closeRedisClient(): Promise<void> {
  if (globalRedisClient) {
    await globalRedisClient.quit();
    globalRedisClient = null;
    redisInitialized = false;
  }
}
