import type Redis from 'ioredis';

const CALLBACK_DELIVERY_TTL_SECONDS = 6 * 60 * 60;

const MARK_DELIVERY_CHUNK_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local next = tonumber(ARGV[1])
if next > current then redis.call('SET', KEYS[1], next, 'EX', ARGV[2]) end
return math.max(current, next)
`;

export const getDeliveredChunkCount = async (redis: Redis, key: string): Promise<number> =>
  Number((await redis.get(key)) || 0);

export const markDeliveryChunk = async (
  redis: Redis,
  key: string,
  deliveredChunkCount: number,
): Promise<void> => {
  await redis.eval(
    MARK_DELIVERY_CHUNK_SCRIPT,
    1,
    key,
    deliveredChunkCount,
    CALLBACK_DELIVERY_TTL_SECONDS,
  );
};
