import { PluginListResponse } from '@lobehub/market-sdk';
import { t } from 'i18next';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { notification } from '@/components/AntdStaticMethods';
import { mcpService } from '@/services/mcp';
import { pluginService } from '@/services/plugin';
import { toolService } from '@/services/tool';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { PluginInstallError } from '@/types/tool/plugin';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';

const n = setNamespace('mcpStore');

export interface PluginMCPStoreAction {
  installMCPPlugin: (identifier: string) => Promise<void>;
  uninstallMCPPlugin: (identifier: string) => Promise<void>;
  useFetchMCPPluginStore: (params: { keywords: string }) => SWRResponse<PluginListResponse>;
}

export const createMCPPluginStoreSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  PluginMCPStoreAction
> = (set, get) => ({
  installMCPPlugin: async (name) => {
    const plugin = mcpStoreSelectors.getPluginById(name)(get());

    if (!plugin || !plugin.manifestUrl) return;

    const { updateInstallLoadingState, refreshPlugins } = get();
    try {
      updateInstallLoadingState(name, true);
      const data = await toolService.getMCPPluginManifest(plugin.identifier);

      console.log(data);
      const result = await mcpService.checkInstallation(data);
      if (result.success) {
        console.log('result', result);
      }

      // 4. 存储 manifest 信息
      await pluginService.installPlugin({
        identifier: plugin.identifier,
        manifest: data,
        type: 'plugin',
      });
      await refreshPlugins();

      updateInstallLoadingState(name, undefined);
    } catch (error) {
      console.error(error);
      updateInstallLoadingState(name, undefined);

      const err = error as PluginInstallError;
      notification.error({
        description: t(`error.${err.message}`, { ns: 'plugin' }),
        message: t('error.installError', { name: plugin.name, ns: 'plugin' }),
      });
    }
  },
  uninstallMCPPlugin: async (identifier) => {
    await pluginService.uninstallPlugin(identifier);
    await get().refreshPlugins();
  },
  useFetchMCPPluginStore: () =>
    useSWR<PluginListResponse>('loadMCPPluginStore', () => toolService.getMCPPluginList(), {
      onSuccess(data) {
        set({ categories: data.categories, mcpPluginItems: data.items });
      },
      revalidateOnFocus: false,
    }),
});
