import { ThemeMode } from 'antd-style';
import { produce } from 'immer';
import { merge } from 'lodash-es';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_AGENT, DEFAULT_BASE_SETTINGS, DEFAULT_SETTINGS } from '@/const/settings';
import { MetaData } from '@/types/meta';
import type { LobeAgentSession } from '@/types/session';
import { LobeAgentConfig } from '@/types/session';
import type { GlobalSettings } from '@/types/settings';
import { setNamespace } from '@/utils/storeDebug';

import type { SidebarTabKey } from './initialState';
import { AppSettingsState } from './initialState';
import type { SettingsStore } from './store';

const t = setNamespace('settings');

/**
 * 设置操作
 */
export interface SettingsAction {
  importAppSettings: (settings: GlobalSettings) => void;
  resetAgentConfig: () => void;
  resetAgentMeta: () => void;
  resetBaseSettings: () => void;
  resetDefaultAgent: () => void;
  /**
   * 重置设置
   */
  resetSettings: () => void;
  setAgentConfig: (config: Partial<LobeAgentSession['config']>) => void;
  setAgentMeta: (meta: Partial<LobeAgentSession['meta']>) => void;
  /**
   * 设置全局设置
   * @param settings - 全局设置
   */
  setAppSettings: (settings: AppSettingsState) => void;
  /**
   * 设置部分配置设置
   * @param settings - 部分配置设置
   */
  setSettings: (settings: Partial<GlobalSettings>) => void;
  /**
   * 设置主题模式
   * @param themeMode - 主题模式
   */
  setThemeMode: (themeMode: ThemeMode) => void;
  /**
   * 切换侧边栏选项
   * @param key - 选中的侧边栏选项
   */
  switchSideBar: (key: SidebarTabKey) => void;
  toggleAgentPanel: (visible?: boolean) => void;
  toggleAgentPlugin: (pluginId: string) => void;
}

export const createSettings: StateCreator<
  SettingsStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (set, get) => ({
  importAppSettings: (importAppSettings) => {
    const { setSettings } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { OPENAI_API_KEY: _, password: __, ...settings } = importAppSettings;

    setSettings({
      ...settings,
      // 如果用户存在用户头像，那么不做导入
      avatar: !get().settings.avatar ? settings.avatar : get().settings.avatar,
    });
  },
  resetAgentConfig: () => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent.config = DEFAULT_AGENT.config;
    });
    set({ settings }, false, t('resetAgentConfig'));
  },
  resetAgentMeta: () => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent.meta = DEFAULT_AGENT.meta;
    });
    set({ settings }, false, t('resetAgentMeta'));
  },
  resetBaseSettings: () => {
    const settings = get().settings;

    set({ settings: { ...settings, ...DEFAULT_BASE_SETTINGS } }, false, t('resetBaseSettings'));
  },
  resetDefaultAgent: () => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent = DEFAULT_AGENT;
    });
    set({ settings }, false, t('resetDefaultAgent'));
  },
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS }, false, t('resetSettings'));
  },
  setAgentConfig: (config) => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      const oldConfig = draft.defaultAgent.config as LobeAgentConfig;
      draft.defaultAgent.config = merge(oldConfig, config);
    });

    set({ settings }, false, t('setAgentConfig', config));
  },
  setAgentMeta: (meta) => {
    const settings = produce(get().settings, (draft) => {
      const oldMeta = draft.defaultAgent.meta as MetaData;
      draft.defaultAgent.meta = merge(oldMeta, meta);
    });

    set({ settings }, false, t('setAgentMeta', meta));
  },
  setAppSettings: (settings) => {
    set({ ...settings }, false, t('setAppSettings', settings));
  },
  setSettings: (settings) => {
    const oldSetting = get().settings;
    set({ settings: merge(oldSetting, settings) }, false, t('setSettings', settings));
  },
  setThemeMode: (themeMode) => {
    get().setSettings({ themeMode });
  },
  switchSideBar: (key) => {
    set({ sidebarKey: key }, false, t('switchSideBar', key));
  },
  toggleAgentPanel: (newValue) => {
    const showAgentConfig = typeof newValue === 'boolean' ? newValue : !get().showAgentConfig;

    set({ showAgentConfig }, false, t('toggleAgentPanel', newValue));
  },
  toggleAgentPlugin: (id: string) => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      const oldConfig = draft.defaultAgent.config as LobeAgentConfig;
      if (oldConfig.plugins === undefined) {
        oldConfig.plugins = [id];
      } else {
        if (oldConfig.plugins.includes(id)) {
          oldConfig.plugins.splice(oldConfig.plugins.indexOf(id), 1);
        } else {
          oldConfig.plugins.push(id);
        }
      }
    });

    set({ settings }, false, t('toggleAgentPlugin', id));
  },
});
