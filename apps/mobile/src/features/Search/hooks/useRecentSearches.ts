import { useCallback, useEffect, useState } from 'react';

import { cacheStorage } from '@/utils/storage';

const MAX_RECENT_SEARCHES = 10;

/**
 * 最近搜索记录 Hook
 * @param storageKey 存储键名，用于区分不同场景的搜索历史
 */
export const useRecentSearches = (storageKey: string) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 加载最近搜索记录
  useEffect(() => {
    try {
      const stored = cacheStorage.getString(storageKey);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, [storageKey]);

  // 保存搜索记录
  const saveRecentSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item !== trimmed);
        const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        try {
          cacheStorage.set(storageKey, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save recent searches:', error);
        }
        return updated;
      });
    },
    [storageKey],
  );

  // 删除单个搜索记录
  const removeRecentSearch = useCallback(
    (query: string) => {
      setRecentSearches((prev) => {
        const updated = prev.filter((item) => item !== query);
        try {
          cacheStorage.set(storageKey, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to remove recent search:', error);
        }
        return updated;
      });
    },
    [storageKey],
  );

  // 清空搜索记录
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      cacheStorage.delete(storageKey);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, [storageKey]);

  return {
    clearRecentSearches,
    recentSearches,
    removeRecentSearch,
    saveRecentSearch,
  };
};
