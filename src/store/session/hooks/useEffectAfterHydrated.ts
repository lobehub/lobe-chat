import { useEffect } from 'react';

import { useSessionStore } from '../store';

export const useEffectAfterSessionHydrated = (
  fn: (session: typeof useSessionStore) => void,
  deps: any[] = [],
) => {
  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();

    if (hasRehydrated) {
      fn(useSessionStore);
    }
  }, deps);
};
