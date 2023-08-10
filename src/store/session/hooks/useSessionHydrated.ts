import { useEffect, useState } from 'react';

import { useSessionStore } from '@/store/session';

export const useSessionHydrated = () => {
  // 根据 sessions 是否有值来判断是否已经初始化
  const hasInited = !!Object.values(useSessionStore.getState().sessions).length;

  const [isInit, setInit] = useState(hasInited);

  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();

    if (hasRehydrated && !isInit) {
      setInit(true);
    }
  }, []);

  return isInit;
};
