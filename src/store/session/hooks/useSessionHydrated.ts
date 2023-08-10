import { useEffect, useState } from 'react';

import { useSessionStore } from '@/store/session';

export const useSessionHydrated = () => {
  const [isInit, setInit] = useState(false);

  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();

    if (hasRehydrated) {
      setInit(true);
    }
  }, []);

  return isInit;
};
