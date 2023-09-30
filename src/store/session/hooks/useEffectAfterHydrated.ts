import { useEffect } from 'react';

import { SessionStore, useSessionStore } from '../store';

export const useEffectAfterSessionHydrated = (
  fn: (session: typeof useSessionStore, store: SessionStore) => void,
  deps: any[] = [],
) => {
  // const hasTrigger = useRef(false);
  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();

    if (hasRehydrated) {
      // equal useEffect triggered multi-time
      fn(useSessionStore, useSessionStore.getState());
    } else {
      // keep onFinishHydration just are triggered only once
      // if (hasTrigger.current) return;
      //
      // hasTrigger.current = true;
      // equal useEffect first trigger
      useSessionStore.persist.onFinishHydration(() => {
        fn(useSessionStore, useSessionStore.getState());
      });
    }
  }, deps);
};
