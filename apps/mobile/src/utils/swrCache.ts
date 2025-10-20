import superjson from 'superjson';

import { cacheStorage } from '@/utils/storage';

const SWR_CACHE_STORAGE_KEY = 'lobe-chat-swr-cache-v1';
const PERSIST_DEBOUNCE_MS = 1000;

type CacheEntry = [string, any];

const isPersistableValue = (value: any): value is Record<string, any> => {
  if (!value || typeof value !== 'object') return false;
  if (value instanceof Promise) return false;

  const record = value as Record<string, any>;
  return 'data' in record || 'error' in record;
};

const loadInitialEntries = (): CacheEntry[] => {
  const raw = cacheStorage.getString(SWR_CACHE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = superjson.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (entry): entry is CacheEntry =>
          Array.isArray(entry) && entry.length === 2 && typeof entry[0] === 'string',
      );
    }
  } catch (error) {
    console.error('[SWRCache] Failed to parse persisted entries', error);
  }

  return [];
};

type Throttled = (() => void) & { flush: () => void };

const createThrottle = (fn: () => void, wait: number): Throttled => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const invoke = () => {
    timeout = null;
    fn();
  };

  const throttled = (() => {
    if (timeout !== null) return;
    timeout = setTimeout(invoke, wait);
  }) as Throttled;

  throttled.flush = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    fn();
  };

  return throttled;
};

class PersistedSWRCache extends Map<string, any> {
  private readonly persist: Throttled;

  constructor(initialEntries: CacheEntry[]) {
    super();

    this.persist = createThrottle(() => {
      try {
        const entriesForStorage: CacheEntry[] = [];

        for (const [key, value] of this.entries()) {
          if (!isPersistableValue(value)) continue;

          entriesForStorage.push([key, value]);
        }

        if (entriesForStorage.length === 0) {
          cacheStorage.delete(SWR_CACHE_STORAGE_KEY);
          return;
        }

        const serialized = superjson.stringify(entriesForStorage);
        cacheStorage.set(SWR_CACHE_STORAGE_KEY, serialized);
      } catch (error) {
        console.error('[SWRCache] Failed to persist entries', error);
      }
    }, PERSIST_DEBOUNCE_MS);

    initialEntries.forEach(([key, value]) => {
      super.set(key, value);
    });
  }

  override set(key: string, value: any) {
    super.set(key, value);
    this.persist();
    return this;
  }

  override delete(key: string) {
    const deleted = super.delete(key);
    if (deleted) this.persist();
    return deleted;
  }

  override clear(): void {
    super.clear();
    this.persist.flush();
  }
}

let activeCache: PersistedSWRCache | null = null;

export const createPersistedSWRCache = (): Map<string, any> => {
  const cache = new PersistedSWRCache(loadInitialEntries());
  activeCache = cache;
  return cache;
};

export const clearPersistedSWRCache = () => {
  activeCache?.clear();
  cacheStorage.delete(SWR_CACHE_STORAGE_KEY);
  activeCache = null;
};

export { SWR_CACHE_STORAGE_KEY };
