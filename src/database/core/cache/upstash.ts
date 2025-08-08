import { upstashCache } from 'drizzle-orm/cache/upstash';

/**
 * Optional Upstash cache provider for Drizzle.
 * Only enabled when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN exist.
 */
export const getDrizzleCache = (): ReturnType<typeof upstashCache> | undefined => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return undefined;

  return upstashCache({ global: true, token, url });
};
