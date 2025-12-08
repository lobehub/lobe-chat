import debug from 'debug';
import Redis from 'ioredis';

import { redisEnv } from '@/envs/redis';

const log = debug('lobe-server:agent-runtime:redis');

/**
 * Get Redis URL from environment
 */
const getRedisUrl = (): string | undefined => {
  return redisEnv.REDIS_URL;
};

/**
 * Get Redis connection description for logging (hide sensitive parts)
 */
const getRedisConnectionDescription = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return 'redis://***';
  }
};

/**
 * Create Redis client instance for Agent Runtime
 */
export const createAgentRuntimeRedisClient = (url?: string): Redis | null => {
  const redisUrl = url || getRedisUrl();

  if (!redisUrl) {
    console.warn(
      '[Agent Runtime Redis] No Redis URL available. Agent Runtime features are disabled.',
    );
    return null;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });

  client.on('connect', () => {
    log('Connected to Redis: %s', getRedisConnectionDescription(redisUrl));
  });

  client.on('error', (error) => {
    console.error('[Agent Runtime Redis] Redis connection error:', error);
  });

  client.on('close', () => {
    log('Redis connection closed');
  });

  return client;
};

/**
 * Global Redis client instance for Agent Runtime (singleton pattern)
 */
let globalAgentRuntimeRedisClient: Redis | null = null;
let redisInitialized = false;

/**
 * Get global Redis client instance for Agent Runtime
 */
export function getAgentRuntimeRedisClient(): Redis | null {
  if (!redisInitialized) {
    globalAgentRuntimeRedisClient = createAgentRuntimeRedisClient();
    redisInitialized = true;
  }
  return globalAgentRuntimeRedisClient;
}

/**
 * Close global Redis client connection
 */
export async function closeAgentRuntimeRedisClient(): Promise<void> {
  if (globalAgentRuntimeRedisClient) {
    await globalAgentRuntimeRedisClient.quit();
    globalAgentRuntimeRedisClient = null;
    redisInitialized = false;
  }
}
