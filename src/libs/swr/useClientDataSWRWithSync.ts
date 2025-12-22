/**
 * useClientDataSWR with automatic Zustand store sync
 *
 * 解决 SWR 缓存数据无法立即同步到 Zustand store 的问题。
 * 当 SWR 从 localStorage 缓存返回数据时，会自动通过 onData 回调同步到 store。
 */

import { useEffect, useRef } from 'react';
import type { SWRConfiguration, SWRResponse } from 'swr';

import { useClientDataSWR } from './index';

type Key = string | readonly unknown[] | null | undefined;

interface UseClientDataSWRWithSyncOptions<T> extends SWRConfiguration<T> {
  /**
   * 数据同步回调，当有数据时会被调用（包括缓存数据和新数据）
   * 用于将数据同步到 Zustand store
   */
  onData?: (data: T) => void;
  /**
   * 是否跳过同步（可选，用于条件性跳过）
   */
  skipSync?: boolean;
}

/**
 * useClientDataSWR 的增强版本，支持自动同步缓存数据到 Zustand store
 *
 * @example
 * ```ts
 * useClientDataSWRWithSync(
 *   isLogin ? ['fetchAgentList', isLogin] : null,
 *   () => homeService.getSidebarAgentList(),
 *   {
 *     onData: (data) => {
 *       // 自动同步到 store，无论是缓存还是新数据
 *       set({ ...mapResponseToState(data), isInit: true });
 *     },
 *     skipSync: state.isInit, // 可选：已初始化后跳过
 *   }
 * );
 * ```
 */
export function useClientDataSWRWithSync<T>(
  key: Key,
  fetcher: (() => Promise<T>) | null,
  options?: UseClientDataSWRWithSyncOptions<T>,
): SWRResponse<T> {
  const { onData, skipSync, onSuccess, ...swrOptions } = options || {};
  const hasSyncedRef = useRef(false);

  const response = useClientDataSWR<T>(key, fetcher, {
    ...swrOptions,
    onSuccess: (data, key, config) => {
      // 调用原始的 onSuccess
      onSuccess?.(data, key, config);
      // 也通过 onData 同步
      if (onData && !skipSync) {
        onData(data);
        hasSyncedRef.current = true;
      }
    },
  });

  const { data } = response;

  // 当有缓存数据时，立即同步到 store
  useEffect(() => {
    if (data && onData && !skipSync && !hasSyncedRef.current) {
      onData(data);
      hasSyncedRef.current = true;
    }
  }, [data, onData, skipSync]);

  // 当 key 变化时重置同步状态
  useEffect(() => {
    hasSyncedRef.current = false;
  }, [key?.toString()]);

  return response;
}
