import { authEnv } from '@/envs/auth';
import { getRedisConfig } from '@/envs/redis';
import { initializeRedis, isRedisEnabled } from '@/libs/redis';

const APPLE_TRUSTED_ORIGIN = 'https://appleid.apple.com';

/**
 * Normalize a URL-like string to an origin with https fallback.
 */
export const normalizeOrigin = (url?: string) => {
  if (!url) return undefined;

  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    return new URL(normalizedUrl).origin;
  } catch {
    return undefined;
  }
};

/**
 * Build trusted origins with env override and Vercel-aware defaults.
 */
export const getTrustedOrigins = (enabledSSOProviders: string[]) => {
  if (authEnv.AUTH_TRUSTED_ORIGINS) {
    const originsFromEnv = authEnv.AUTH_TRUSTED_ORIGINS.split(',')
      .map((item) => normalizeOrigin(item.trim()))
      .filter(Boolean) as string[];

    if (originsFromEnv.length > 0) return Array.from(new Set(originsFromEnv));
  }

  const defaults = [
    authEnv.NEXT_PUBLIC_AUTH_URL,
    normalizeOrigin(process.env.APP_URL),
    normalizeOrigin(process.env.VERCEL_BRANCH_URL),
    normalizeOrigin(process.env.VERCEL_URL),
  ].filter(Boolean) as string[];

  const baseTrustedOrigins = defaults.length > 0 ? Array.from(new Set(defaults)) : undefined;

  if (!enabledSSOProviders.includes('apple')) return baseTrustedOrigins;

  const mergedOrigins = new Set(baseTrustedOrigins || []);
  mergedOrigins.add(APPLE_TRUSTED_ORIGIN);

  return Array.from(mergedOrigins);
};

/**
 * Build Better Auth secondaryStorage backed by Redis.
 * Uses the shared Redis manager to avoid duplicate connections and prefixes keys to prevent clashes.
 */
export const createSecondaryStorage = () => {
  const redisConfig = getRedisConfig();
  if (!isRedisEnabled(redisConfig)) return undefined;

  const secondaryStorageKeyPrefix = 'better-auth:';

  const buildKey = (key: string) => `${secondaryStorageKeyPrefix}${key}`;

  const getRedisClient = async () => {
    const redisClient = await initializeRedis(redisConfig);
    if (!redisClient) {
      throw new Error('Redis secondary storage is enabled but failed to initialize');
    }

    return redisClient;
  };

  return {
    delete: async (key: string) => {
      const redisClient = await getRedisClient();
      await redisClient.del(buildKey(key));
    },
    get: async (key: string) => {
      const redisClient = await getRedisClient();
      return (await redisClient.get(buildKey(key))) ?? null;
    },
    set: async (key: string, value: string, ttl?: number) => {
      const redisClient = await getRedisClient();
      if (typeof ttl === 'number') {
        await redisClient.set(buildKey(key), value, { ex: ttl });
        return;
      }

      await redisClient.set(buildKey(key), value);
    },
  };
};
