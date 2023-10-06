import { useOnFinishHydrationGlobal } from '@/store/global';

import { SettingsTabs } from '../initialState';

/**
 * 切换设置侧边栏选项
 */
export const useSwitchSideBarOnInit = (key: SettingsTabs) => {
  useOnFinishHydrationGlobal((store) => {
    store.switchSettingTabs(key);
  });
};
