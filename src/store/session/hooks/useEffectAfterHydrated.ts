import { useEffect } from 'react';

import { useSessionStore } from '../store';

export const useEffectAfterSessionHydrated = (
  fn: (session: typeof useSessionStore) => void,
  deps: any[] = [],
) => {
  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();

    if (hasRehydrated) {
      // 等价 useEffect 多次触发
      fn(useSessionStore);
    } else {
      // 等价于 useEffect 第一次触发
      useSessionStore.persist.onFinishHydration(() => {
        fn(useSessionStore);
      });
    }
  }, deps);
};
