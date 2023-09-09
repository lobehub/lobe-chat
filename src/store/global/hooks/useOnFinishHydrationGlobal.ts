import { useEffect } from 'react';

import { GlobalStore, useGlobalStore } from '../store';

/**
 * 当 Session 水合完毕后才会执行的 useEffect
 * @param fn
 * @param deps
 */
export const useOnFinishHydrationGlobal = (fn: (state: GlobalStore) => void, deps: any[] = []) => {
  useEffect(() => {
    useGlobalStore.persist.onFinishHydration(() => {
      fn(useGlobalStore.getState());
    });
  }, deps);
};
