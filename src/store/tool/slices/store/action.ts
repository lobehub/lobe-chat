import { LobeChatPluginsMarketIndex, pluginManifestSchema } from '@lobehub/chat-plugin-sdk';
import { notification } from 'antd';
import { t } from 'i18next';
import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { pluginService } from '@/services/plugin';
import { pluginSelectors } from '@/store/tool/selectors';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { PluginStoreState } from './initialState';

const n = setNamespace('pluginStore');

interface PluginInstallError {
  detail?: string;
  message: 'noManifest' | 'fetchError' | 'manifestInvalid';
}

export interface PluginStoreAction {
  installPlugin: (identifier: string) => Promise<void>;
  installPlugins: (plugins: string[]) => Promise<void>;
  loadPluginStore: () => Promise<LobeChatPluginsMarketIndex>;
  unInstallPlugin: (identifier: string) => void;
  updateInstallLoadingState: (key: string, value: boolean | undefined) => void;
  useFetchPluginStore: () => SWRResponse<LobeChatPluginsMarketIndex>;
}

export const createPluginStoreSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  PluginStoreAction
> = (set, get) => ({
  installPlugin: async (name) => {
    const plugin = pluginSelectors.getPluginMetaById(name)(get());
    if (!plugin) return;

    try {
      // 1. valid plugin

      if (!plugin.manifest) {
        throw new TypeError('noManifest');
      }

      // 2. 发送请求
      get().updateInstallLoadingState(name, true);
      const data = await pluginService.fetchManifest(plugin.manifest);

      get().updateInstallLoadingState(name, undefined);
      if (!data) {
        throw new TypeError('fetchError');
      }

      // 3. 校验插件文件格式规范
      const { success } = pluginManifestSchema.safeParse(data);

      if (!success) {
        throw new TypeError('manifestInvalid');
      }

      // 4. 存储 manifest 信息
      get().dispatchPluginManifest({ id: plugin.identifier, plugin: data, type: 'addManifest' });
    } catch (error) {
      console.error(error);
      const err = error as PluginInstallError;

      notification.error({
        description: t(`error.${err.message}`, { ns: 'plugin' }),
        message: t('error.installError', { name: plugin.meta.title, ns: 'plugin' }),
      });
    }
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
