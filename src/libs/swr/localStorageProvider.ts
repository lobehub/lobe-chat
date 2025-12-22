/**
 * SWR localStorage Cache Provider
 *
 * 为选定的 SWR 请求提供 localStorage 持久化缓存。
 * 只有在白名单中的 Key 才会被缓存到 localStorage。
 *
 * @example
 * ```tsx
 * <SWRConfig value={{ provider: createLocalStorageProvider() }}>
 *   <App />
 * </SWRConfig>
 * ```
 */

// ============================================================================
// 全局缓存实例和配置好的 useSWR
// ============================================================================


interface CacheEntry<T = unknown> {
  /** 缓存数据 */
  data: T;
  /** 缓存时间戳 */
  timestamp: number;
  /** 应用版本号 */
  version: string;
}

export interface LocalStorageCacheOptions {
  /** localStorage 键名，默认 'lobechat-swr-cache' */
  cacheKey?: string;
  /** 允许缓存的 SWR Key 模式（白名单） */
  cacheablePatterns?: string[];
  /** 最大缓存条目数，默认 50 */
  maxEntries?: number;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 缓存过期时间（毫秒），默认 24 小时 */
  ttl?: number;
  /** 应用版本号，版本变化时清空缓存 */
  version?: string;
}

/**
 * 默认允许缓存的 SWR Key 模式
 * 只有匹配这些模式的请求才会被持久化
 */
const DEFAULT_CACHEABLE_PATTERNS: string[] = [
  // 可根据需要添加
];

/**
 * 检查 localStorage 是否可用
 */
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__swr_cache_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * 检查 key 是否匹配白名单模式
 *
 * SWR 的 key 可能是：
 * - 字符串: 'fetchSessions'
 * - 数组序列化后的字符串: '["fetchSessions","user-123"]'
 *
 * 我们检查 key 字符串是否包含任一白名单模式
 */
const matchesCacheablePattern = (key: string, patterns: string[]): boolean => {
  if (patterns.length === 0) return false;
  return patterns.some((pattern) => key.includes(pattern));
};

/**
 * 创建 localStorage 缓存 Provider
 *
 * 特性：
 * - 白名单机制：只缓存指定的 Key
 * - TTL 过期：自动清理过期数据
 * - 版本控制：应用更新时自动清理旧缓存
 * - 容量限制：防止超出 localStorage 限制
 * - SSR 兼容：服务端返回空 Map
 * - 错误恢复：异常时降级到内存缓存
 */
export function createLocalStorageProvider(options: LocalStorageCacheOptions = {}) {
  const {
    cacheKey = 'lobechat-swr-cache',
    ttl = 24 * 60 * 60 * 1000, // 24 hours
    maxEntries = 50,
    version = '1.0.0',
    cacheablePatterns = DEFAULT_CACHEABLE_PATTERNS,
    onError = (error) => console.error('[SWR Cache]', error),
  } = options;

  // SSR 或 localStorage 不可用时返回内存缓存
  if (!isLocalStorageAvailable()) {
    return () => new Map();
  }

  return (): Map<string, unknown> => {
    /**
     * 从 localStorage 加载缓存
     */
    const loadCache = (): Map<string, unknown> => {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (!stored) {
          return new Map();
        }

        const entries: [string, CacheEntry][] = JSON.parse(stored);
        const now = Date.now();

        // 过滤：过期数据、版本不匹配
        const validEntries = entries
          .filter(([, entry]) => {
            const isExpired = now - entry.timestamp > ttl;
            const isValidVersion = entry.version === version;
            return !isExpired && isValidVersion;
          })
          .map(([key, entry]) => [key, entry.data] as [string, unknown]);

        return new Map(validEntries);
      } catch (error) {
        onError(error as Error);
        return new Map();
      }
    };

    const initialData = loadCache();

    // 防抖保存相关变量（放在类外部避免初始化顺序问题）
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    let cacheMapInstance: Map<string, unknown> | null = null;

    const saveCache = () => {
      if (!cacheMapInstance) return;
      try {
        // 只保存白名单中的 key
        const entries = Array.from(cacheMapInstance.entries())
          .filter(([key]) => matchesCacheablePattern(key, cacheablePatterns))
          .slice(-maxEntries)
          .map(([key, data]) => [key, { data, timestamp: Date.now(), version } as CacheEntry]);

        const serialized = JSON.stringify(entries);

        // 检查大小，超过 4MB 时清理一半
        const sizeInMB = new Blob([serialized]).size / (1024 * 1024);
        if (sizeInMB > 4) {
          const reduced = entries.slice(-Math.floor(maxEntries / 2));
          localStorage.setItem(cacheKey, JSON.stringify(reduced));
          console.warn(`[SWR Cache] Cache too large (${sizeInMB.toFixed(2)}MB), cleaned up`);
        } else {
          localStorage.setItem(cacheKey, serialized);
        }
      } catch (error) {
        if ((error as DOMException).name === 'QuotaExceededError') {
          // 容量超限，清空缓存
          try {
            localStorage.removeItem(cacheKey);
          } catch {
            // ignore
          }
          console.error('[SWR Cache] Quota exceeded, cache cleared');
        } else {
          onError(error as Error);
        }
      }
    };

    const debouncedSave = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(saveCache, 2000);
    };

    // 页面卸载时立即保存
    window.addEventListener('beforeunload', () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveCache();
    });

    // 多标签页同步
    window.addEventListener('storage', (event) => {
      if (event.key === cacheKey && event.newValue && cacheMapInstance) {
        try {
          const parsedEntries: [string, CacheEntry][] = JSON.parse(event.newValue);
          // 只更新白名单中的 key
          parsedEntries.forEach(([key, entry]) => {
            if (matchesCacheablePattern(key, cacheablePatterns)) {
              cacheMapInstance!.set(key, entry.data);
            }
          });
        } catch (error) {
          onError(error as Error);
        }
      }
    });

    /**
     * 创建带拦截的 Map
     * 只有白名单中的 key 才会触发持久化
     */
    class LocalStorageCacheMap extends Map<string, unknown> {
      private initialized = false;

      constructor(entries?: readonly (readonly [string, unknown])[] | null) {
        super();
        // 手动添加初始数据，避免在 super() 中触发 set
        if (entries) {
          for (const [key, value] of entries) {
            super.set(key, value);
          }
        }
        this.initialized = true;
      }

      get(key: string): unknown {
        return super.get(key);
      }

      set(key: string, value: unknown): this {
        super.set(key, value);
        // 只有初始化完成后且在白名单中的 key 才触发保存
        if (this.initialized && matchesCacheablePattern(key, cacheablePatterns)) {
          debouncedSave();
        }
        return this;
      }

      delete(key: string): boolean {
        const result = super.delete(key);
        if (this.initialized && matchesCacheablePattern(key, cacheablePatterns)) {
          debouncedSave();
        }
        return result;
      }
    }

    // 创建 Map 实例
    const cacheMap = new LocalStorageCacheMap(Array.from(initialData.entries()));
    cacheMapInstance = cacheMap;

    return cacheMap;
  };
}

/**
 * 清除 SWR localStorage 缓存
 * 可用于用户手动清理或版本更新时调用
 */
export function clearSWRCache(cacheKey = 'lobechat-swr-cache'): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(cacheKey);
    console.log('[SWR Cache] Cache cleared');
  } catch (error) {
    console.error('[SWR Cache] Failed to clear cache:', error);
  }
}

/**
 * SWR localStorage 缓存白名单
 * 只有匹配这些模式的 Key 才会被持久化到 localStorage
 */
const SWR_CACHEABLE_PATTERNS = [
  // 首页数据
  'fetchAgentList', // 助手列表
  'fetchGroups', // 分组列表
  'fetchRecentTopics', // 最近话题
  'fetchRecentResources', // 最近资源
  'fetchRecentPages', // 最近页面
  // 聊天页面数据
  'SWR_USE_FETCH_TOPIC', // 话题列表（按 agentId/groupId 分别缓存）
  // 社区/市场数据
  'assistant-list', // 助手市场列表
  'mcp-list', // MCP 列表
];


/**
 * 导出 provider 工厂函数，用于 SWRConfig
 */
export const swrCacheProvider = () => {
  return createLocalStorageProvider({
    cacheablePatterns: SWR_CACHEABLE_PATTERNS,
    ttl: 12 * 60 * 60 * 1000, // 12 hours
  });
};
