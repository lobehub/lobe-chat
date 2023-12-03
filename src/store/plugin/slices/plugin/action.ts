import {
  LobeChatPluginManifest,
  LobeChatPluginsMarketIndex,
  pluginManifestSchema,
} from '@lobehub/chat-plugin-sdk';
import { message } from 'antd';
import { produce } from 'immer';
import { merge, uniq } from 'lodash-es';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { pluginService } from '@/services/plugin';
import { pluginSelectors } from '@/store/plugin/selectors';
import { LobeSessions } from '@/types/session';
import { setNamespace } from '@/utils/storeDebug';

import { PluginStore } from '../../store';
import { PluginDispatch, pluginManifestReducer } from './reducers/manifest';

const n = setNamespace('plugin');

/**
 * 插件接口
 */
export interface PluginAction {
  checkLocalEnabledPlugins: (sessions: LobeSessions) => void;
  checkPluginsIsInstalled: (plugins: string[]) => void;
  deletePluginSettings: (id: string) => void;
  dispatchPluginManifest: (payload: PluginDispatch) => void;
  installPlugin: (identifier: string) => Promise<void>;
  installPlugins: (plugins: string[]) => Promise<void>;
  loadPluginStore: () => Promise<LobeChatPluginsMarketIndex>;
  resetPluginSettings: () => void;
  updateManifestLoadingState: (key: string, value: boolean | undefined) => void;
  updatePluginSettings: <T>(id: string, settings: Partial<T>) => void;
  useCheckPluginsIsInstalled: (plugins: string[]) => SWRResponse;
  useFetchPluginStore: () => SWRResponse<LobeChatPluginsMarketIndex>;
}

export const createPluginSlice: StateCreator<
  PluginStore,
  [['zustand/devtools', never]],
  [],
  PluginAction
> = (set, get) => ({
  checkLocalEnabledPlugins: async (sessions) => {
    const { checkPluginsIsInstalled } = get();

    let enabledPlugins: string[] = [];

    for (const session of sessions) {
      const plugins = session.config.plugins;
      if (!plugins || plugins.length === 0) continue;

      enabledPlugins = [...enabledPlugins, ...plugins];
    }

    const plugins = uniq(enabledPlugins);

    await checkPluginsIsInstalled(plugins);
  },
  checkPluginsIsInstalled: async (plugins) => {
    // if there is no plugins, just skip.
    if (plugins.length === 0) return;

    const { loadPluginStore, installPlugins } = get();

    // check if the store is empty
    // if it is, we need to load the plugin store
    if (pluginSelectors.onlinePluginStore(get()).length === 0) {
      await loadPluginStore();
    }

    await installPlugins(plugins);

    set({ manifestPrepared: true }, false, n('checkPluginsIsInstalled'));
  },
  deletePluginSettings: (id) => {
    set(
      produce((draft) => {
        draft.pluginsSettings[id] = undefined;
      }),
      false,
      n('deletePluginSettings'),
    );
  },
  dispatchPluginManifest: (payload) => {
    const { pluginManifestMap } = get();
    const nextManifest = pluginManifestReducer(pluginManifestMap, payload);

    set({ pluginManifestMap: nextManifest }, false, n('dispatchPluginManifest', payload));
  },
  installPlugin: async (name) => {
    const plugin = pluginSelectors.getPluginMetaById(name)(get());

    // 1. valid plugin

    if (!plugin) return;

    if (!plugin.manifest) {
      message.error('插件未配置 描述文件');
      return;
    }

    // 2. 发送请求
    get().updateManifestLoadingState(name, true);
    let data: LobeChatPluginManifest | null;

    try {
      const res = await fetch(plugin.manifest);

      data = await res.json();
    } catch (error) {
      data = null;
      console.error(error);
    }

    get().updateManifestLoadingState(name, undefined);
    if (!data) {
      message.error(`插件 ${plugin.meta.title} 描述文件请求失败`);
      return;
    }

    // 3. 校验插件文件格式规范
    const { success } = pluginManifestSchema.safeParse(data);

    if (!success) {
      message.error('插件描述文件格式错误');
      return;
    }

    // 4. 存储 manifest 信息
    get().dispatchPluginManifest({ id: plugin.identifier, plugin: data, type: 'addManifest' });
  },
  installPlugins: async (plugins) => {
    const { installPlugin } = get();

    await Promise.all(plugins.map((identifier) => installPlugin(identifier)));
  },
  loadPluginStore: async () => {
    const pluginMarketIndex = await pluginService.getPluginList();

    set({ pluginList: pluginMarketIndex.plugins }, false, n('loadPluginList'));

    return pluginMarketIndex;
  },
  resetPluginSettings: () => {
    set({ pluginsSettings: {} }, false, n('resetPluginSettings'));
  },
  updateManifestLoadingState: (key, value) => {
    set(
      produce((draft) => {
        draft.pluginManifestLoading[key] = value;
      }),
      false,
      n('updateManifestLoadingState'),
    );
  },
  updatePluginSettings: (id, settings) => {
    set(
      produce((draft) => {
        draft.pluginsSettings[id] = merge({}, draft.pluginsSettings[id], settings);
      }),
      false,
      n('updatePluginSettings'),
    );
  },

  useCheckPluginsIsInstalled: (plugins) => useSWR(plugins, get().checkPluginsIsInstalled),

  useFetchPluginStore: () =>
    useSWR<LobeChatPluginsMarketIndex>('loadPluginStore', get().loadPluginStore),
});
