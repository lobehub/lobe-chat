import {
  LobeChatPluginManifest,
  LobeChatPluginsMarketIndex,
  pluginManifestSchema,
} from '@lobehub/chat-plugin-sdk';
import { message } from 'antd';
import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { pluginService } from '@/services/plugin';
import { pluginSelectors } from '@/store/plugin/selectors';
import { setNamespace } from '@/utils/storeDebug';

import { PluginStore } from '../../store';
import { PluginStoreState } from './initialState';

const n = setNamespace('pluginStore');

export interface PluginStoreAction {
  installPlugin: (identifier: string) => Promise<void>;
  installPlugins: (plugins: string[]) => Promise<void>;
  loadPluginStore: () => Promise<LobeChatPluginsMarketIndex>;
  unInstallPlugin: (identifier: string) => void;
  updateInstallLoadingState: (key: string, value: boolean | undefined) => void;
  useFetchPluginStore: () => SWRResponse<LobeChatPluginsMarketIndex>;
}

export const createPluginStoreSlice: StateCreator<
  PluginStore,
  [['zustand/devtools', never]],
  [],
  PluginStoreAction
> = (set, get) => ({
  installPlugin: async (name) => {
    const plugin = pluginSelectors.getPluginMetaById(name)(get());

    // 1. valid plugin

    if (!plugin) return;

    if (!plugin.manifest) {
      message.error('插件未配置 描述文件');
      return;
    }

    // 2. 发送请求
    get().updateInstallLoadingState(name, true);
    let data: LobeChatPluginManifest | null;

    try {
      const res = await fetch(plugin.manifest);

      data = await res.json();
    } catch (error) {
      data = null;
      console.error(error);
    }

    get().updateInstallLoadingState(name, undefined);
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
  unInstallPlugin: (identifier) => {
    get().dispatchPluginManifest({ id: identifier, type: 'deleteManifest' });
  },

  updateInstallLoadingState: (key, value) => {
    set(
      produce((draft: PluginStoreState) => {
        draft.pluginInstallLoading[key] = value;
      }),
      false,
      n('updateInstallLoadingState'),
    );
  },
  useFetchPluginStore: () =>
    useSWR<LobeChatPluginsMarketIndex>('loadPluginStore', get().loadPluginStore),
});
