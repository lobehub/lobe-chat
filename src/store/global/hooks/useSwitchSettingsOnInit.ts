import { SettingsTabs } from '../initialState';
import { useGlobalStore } from '../store';

/**
 * 切换设置侧边栏选项
 */
export const useSwitchSideBarOnInit = (key: SettingsTabs) => {
  useGlobalStore.getState().switchSettingTabs(key);
};
