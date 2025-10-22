import { cacheStorage } from './storage';
import { clearPersistedSWRCache } from './swrCache';

const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

const getByteLength = (value: string): number => {
  if (encoder) {
    return encoder.encode(value).length;
  }

  let length = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.charCodeAt(index);

    if (codePoint <= 127) {
      length += 1;
    } else if (codePoint <= 2047) {
      length += 2;
    } else if (codePoint >= 55_296 && codePoint <= 56_319) {
      // surrogate pair
      length += 4;
      index += 1;
    } else {
      length += 3;
    }
  }

  return length;
};

export const getCacheSizeInBytes = (): number => {
  try {
    const keys = cacheStorage.getAllKeys();

    return keys.reduce((total, key) => {
      const bufferValue = cacheStorage.getBuffer?.(key);
      if (bufferValue) {
        return total + bufferValue.byteLength;
      }

      const stringValue = cacheStorage.getString(key);
      if (typeof stringValue === 'string') {
        return total + getByteLength(stringValue);
      }

      const numberValue = cacheStorage.getNumber?.(key);
      if (typeof numberValue === 'number') {
        // double precision number takes 8 bytes
        return total + 8;
      }

      return total;
    }, 0);
  } catch (error) {
    console.error('[CacheManager] Failed to calculate cache size', error);
    return 0;
  }
};

export const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  const display =
    value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2);

  return `${display} ${units[exponent]}`;
};

export const getFormattedCacheSize = (): string => formatBytes(getCacheSizeInBytes());

export const clearPersistedCaches = (): void => {
  try {
    clearPersistedSWRCache();
    cacheStorage.clearAll();
    cacheStorage.trim?.();
  } catch (error) {
    console.error('[CacheManager] Failed to clear cache storage', error);
    throw error;
  }
};

export { SWR_CACHE_STORAGE_KEY } from './swrCache';
