import { useEffect, useState } from 'react';

import { useSessionStore } from '../store';

export const useSessionHydrated = () => {
  // 根据 sessions 是否有值来判断是否已经初始化
  const hasInited = !!Object.values(useSessionStore.getState().sessions).length;

  const [isInit, setInit] = useState(hasInited);

  useEffect(() => {
    useSessionStore.persist.onFinishHydration(() => {
      if (!isInit) setInit(true);
    });
  }, []);

  return isInit;
};
