import { useEffect } from 'react';

import { useSessionStore } from '../store';

/**
 * 当 Session 水合完毕后才会执行的 useEffect
 * @param fn
 * @param deps
 */
export const useOnFinishHydrationSession = (fn: () => void, deps: any[] = []) => {
  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();
    // 只有当水合完毕后再开始做操作
    if (!hasRehydrated) return;

    fn();
  }, deps);
};
