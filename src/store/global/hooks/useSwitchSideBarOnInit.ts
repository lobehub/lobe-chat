import { SidebarTabKey } from '../initialState';
import { useGlobalStore } from '../store';
import { useOnFinishHydrationGlobal } from './useOnFinishHydrationGlobal';

/**
 * 切换侧边栏选项
 * @desc 只会在应用初始化时（且水合后）执行一次
 */
export const useSwitchSideBarOnInit = (key: SidebarTabKey) => {
  useOnFinishHydrationGlobal(() => {
    useGlobalStore.getState().switchSideBar(key);
  });
};
