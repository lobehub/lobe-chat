import { useEffect } from 'react';

import { useGlobalStore } from '../store';

export const useEffectAfterGlobalHydrated = (
  fn: (store: typeof useGlobalStore) => void,
  deps: any[] = [],
) => {
  useEffect(() => {
    const hasRehydrated = useGlobalStore.persist.hasHydrated();

    if (hasRehydrated) {
      // 等价 useEffect 多次触发
      fn(useGlobalStore);
    } else {
      // 等价于 useEffect 第一次触发
      useGlobalStore.persist.onFinishHydration(() => {
        fn(useGlobalStore);
      });
    }
  }, deps);
};
