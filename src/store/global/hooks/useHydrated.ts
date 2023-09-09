import { useEffect, useState } from 'react';

import { useGlobalStore } from '../store';

export const useGlobalHydrated = () => {
  // 根据 sessions 是否有值来判断是否已经初始化
  const hasInited = !!Object.values(useGlobalStore.getState().settings).length;

  const [isInit, setInit] = useState(hasInited);

  useEffect(() => {
    useGlobalStore.persist.onFinishHydration(() => {
      if (!isInit) setInit(true);
    });
  }, []);

  return isInit;
};
