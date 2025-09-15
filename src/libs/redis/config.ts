/**
 * Get Redis URL from environment variables
 */
export const getRedisUrl = (): string | undefined => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return undefined;
  }

  return redisUrl;
};

/**
 * Validate if Redis URL is valid
 */
export const validateRedisUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    console.error('[Redis Config] Invalid REDIS_URL format:', url);
    return false;
  }
};

/**
 * Get Redis connection description string for logging (hide password)
 */
export const getRedisConnectionDescription = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (urlObj.password) {
      urlObj.password = '***';
    }
    return urlObj.toString();
  } catch {
    return 'Invalid URL';
  }
};
