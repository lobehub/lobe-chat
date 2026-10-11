import { getRedisClient } from './shared';

/**
 * Atomically increments one Redis counter and refreshes its TTL.
 *
 * Use when:
 * - A budget or rate limit must be shared across server processes and workflow invocations
 *
 * Expects:
 * - `ttlSeconds` outlives the window the key represents
 *
 * Returns:
 * - The counter value after the increment, or `undefined` when Redis is not configured
 */
export const incrementCounter = async (
  key: string,
  ttlSeconds: number,
): Promise<number | undefined> => {
  const redis = getRedisClient();
  if (!redis) return undefined;

  const count = await redis.incr(key);
  await redis.expire(key, ttlSeconds);

  return count;
};

/**
 * Decrements one Redis counter, returning a slot taken by {@link incrementCounter}.
 *
 * Use when:
 * - The work a slot was acquired for did not happen (gate rejected, enqueue failed)
 */
export const decrementCounter = async (key: string): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;

  await redis.decr(key);
};
