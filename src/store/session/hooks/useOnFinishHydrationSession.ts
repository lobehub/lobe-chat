import { useEffect } from 'react';

import { SessionStore, useSessionStore } from '../store';

/**
 * 当 Session 水合完毕后才会执行的 useEffect
 * @param fn
 * @param deps
 */
export const useOnFinishHydrationSession = (
  fn: (state: SessionStore) => void,
  deps: any[] = [],
) => {
  useEffect(() => {
    // 只有当水合完毕后再开始做操作
    useSessionStore.persist.onFinishHydration(() => {
      fn(useSessionStore.getState());
    });
  }, deps);
};
