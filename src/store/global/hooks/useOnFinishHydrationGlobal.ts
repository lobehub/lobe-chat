import { useEffect } from 'react';

import { GlobalStore, useGlobalStore } from '../store';

/**
 * 当 Session 水合完毕后才会执行的 useEffect
 * @param fn
 * @param deps
 */
export const useOnFinishHydrationGlobal = (fn: (state: GlobalStore) => void, deps: any[] = []) => {
  useEffect(() => {
    const hasRehydrated = useGlobalStore.persist.hasHydrated();
    // 只有当水合完毕后再开始做操作
    if (!hasRehydrated) return;

    fn(useGlobalStore.getState());
  }, deps);
};
