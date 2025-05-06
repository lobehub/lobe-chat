import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { t } from 'i18next';
import { produce } from 'immer';
import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { notification } from '@/components/AntdStaticMethods';
import { pluginService } from '@/services/plugin';
import { toolService } from '@/services/tool';
import { pluginStoreSelectors } from '@/store/tool/selectors';
import { LobeTool } from '@/types/tool';
import { PluginInstallError } from '@/types/tool/plugin';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { PluginStoreState } from './initialState';

const n = setNamespace('pluginStore');

const INSTALLED_PLUGINS = 'loadInstalledPlugins';

export interface PluginStoreAction {
  installPlugin: (identifier: string, type?: 'plugin' | 'customPlugin') => Promise<void>;
  installPlugins: (plugins: string[]) => Promise<void>;
  loadPluginStore: () => Promise<LobeChatPluginMeta[]>;
  refreshPlugins: () => Promise<void>;
  uninstallPlugin: (identifier: string) => Promise<void>;

  updateInstallLoadingState: (key: string, value: boolean | undefined) => void;
  useFetchInstalledPlugins: (enabled: boolean) => SWRResponse<LobeTool[]>;
  useFetchPluginStore: () => SWRResponse<LobeChatPluginMeta[]>;
}

export const createPluginStoreSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  PluginStoreAction
> = (set, get) => ({
  installPlugin: async (name, type = 'plugin') => {
    const plugin = pluginStoreSelectors.getPluginById(name)(get());
    if (!plugin) return;

    const { updateInstallLoadingState, refreshPlugins } = get();
    try {
      updateInstallLoadingState(name, true);
      const data = await toolService.getToolManifest(plugin.manifest);

      // 4. 存储 manifest 信息
      await pluginService.installPlugin({ identifier: plugin.identifier, manifest: data, type });
      await refreshPlugins();

      updateInstallLoadingState(name, undefined);
    } catch (error) {
      console.error(error);
      updateInstallLoadingState(name, undefined);

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
    const pluginMarketIndex = await toolService.getToolList();

    set({ pluginStoreList: pluginMarketIndex || [] }, false, n('loadPluginList'));

    return pluginMarketIndex;
  },
  refreshPlugins: async () => {
    await mutate(INSTALLED_PLUGINS);
  },
  uninstallPlugin: async (identifier) => {
    await pluginService.uninstallPlugin(identifier);
    await get().refreshPlugins();
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

  useFetchInstalledPlugins: (enabled: boolean) =>
    useSWR<LobeTool[]>(enabled ? INSTALLED_PLUGINS : null, pluginService.getInstalledPlugins, {
      fallbackData: [],
      onSuccess: (data) => {
        set(
          { installedPlugins: data, loadingInstallPlugins: false },
          false,
          n('useFetchInstalledPlugins'),
        );
      },
      revalidateOnFocus: false,
      suspense: true,
    }),
  useFetchPluginStore: () =>
    useSWR<LobeChatPluginMeta[]>('loadPluginStore', get().loadPluginStore, {
      fallbackData: [],
      revalidateOnFocus: false,
      suspense: true,
    }),
});
