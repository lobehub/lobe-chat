import { useEffect } from 'react';

import { SidebarTabKey } from '../initialState';
import { useGlobalStore } from '../store';

/**
 * 切换侧边栏选项
 * @desc 只会在应用初始化时（且水合后）执行一次
 */
export const useSwitchSideBarOnInit = (key: SidebarTabKey) => {
  useEffect(() => {
    const hasRehydrated = useGlobalStore.persist.hasHydrated();
    if (hasRehydrated) {
      useGlobalStore.getState().switchSideBar(key);
    }
  }, []);
};
