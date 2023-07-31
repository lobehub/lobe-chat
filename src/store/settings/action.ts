import { ThemeMode } from 'antd-style';
import { produce } from 'immer';
import { merge } from 'lodash-es';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_AGENT, DEFAULT_BASE_SETTINGS, DEFAULT_SETTINGS } from '@/const/settings';
import type { LobeAgentSession } from '@/types/session';
import { LobeAgentConfig } from '@/types/session';
import type { GlobalSettings } from '@/types/settings';

import type { SidebarTabKey } from './initialState';
import { AppSettingsState } from './initialState';
import type { SettingsStore } from './store';

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
    const settings = get().settings;
    settings.defaultAgent.config = DEFAULT_AGENT.config;
    set({ settings });
  },
  resetAgentMeta: () => {
    const settings = get().settings;
    settings.defaultAgent.meta = DEFAULT_AGENT.meta;
    set({ settings });
  },
  resetBaseSettings: () => {
    const settings = get().settings;

    set({ settings: { ...settings, ...DEFAULT_BASE_SETTINGS } });
  },
  resetDefaultAgent: () => {
    const settings = get().settings;
    settings.defaultAgent = DEFAULT_AGENT;
    set({ settings });
  },
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
  },
  setAgentConfig: (config) => {
    const settings = get().settings;
    const oldConfig = settings.defaultAgent.config;
    settings.defaultAgent.config = merge(config, oldConfig);

    set({ settings });
  },
  setAgentMeta: (meta) => {
    const settings = get().settings;
    const oldMeta = settings.defaultAgent.meta;
    settings.defaultAgent.meta = merge(meta, oldMeta);

    set({ settings });
  },
  setAppSettings: (settings) => {
    set({ ...settings });
  },
  setSettings: (settings) => {
    const oldSetting = get().settings;
    set({ settings: merge(settings, oldSetting) });
  },
  setThemeMode: (themeMode) => {
    get().setSettings({ themeMode });
  },
  switchSideBar: (key) => {
    set({ sidebarKey: key });
  },
  toggleAgentPanel: (newValue) => {
    const showAgentConfig = typeof newValue === 'boolean' ? newValue : !get().showAgentConfig;

    set({ showAgentConfig });
  },
  toggleAgentPlugin: (id: string) => {
    const settings = get().settings;

    settings.defaultAgent.config = produce(
      settings.defaultAgent.config,
      (draft: LobeAgentConfig) => {
        if (draft.plugins === undefined) {
          draft.plugins = [id];
        } else {
          const plugins = draft.plugins;
          if (plugins.includes(id)) {
            plugins.splice(plugins.indexOf(id), 1);
          } else {
            plugins.push(id);
          }
        }
      },
    );

    set({ settings });
  },
});
