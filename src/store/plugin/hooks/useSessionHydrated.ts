import { useEffect, useState } from 'react';

import { usePluginStore } from '../store';

export const usePluginHydrated = () => {
  // 根据 sessions 是否有值来判断是否已经初始化

  // 并且插件的 manifest 也准备完毕
  const manifestPrepared = usePluginStore((s) => s.manifestPrepared);
  const [isInit, setInit] = useState(false);

  useEffect(() => {
    const hasRehydrated = usePluginStore.persist.hasHydrated();

    if (hasRehydrated && !isInit) {
      setInit(true);
    }
  }, []);

  return isInit && manifestPrepared;
};
