import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { PluginListResponse } from '@lobehub/market-sdk';
import { t } from 'i18next';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { notification } from '@/components/AntdStaticMethods';
import { mcpService } from '@/services/mcp';
import { pluginService } from '@/services/plugin';
import { toolService } from '@/services/tool';
import { globalHelpers } from '@/store/global/helpers';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { MCPPluginListParams } from '@/types/plugins';
import { PluginInstallError } from '@/types/tool/plugin';

import { ToolStore } from '../../store';

export interface PluginMCPStoreAction {
  installMCPPlugin: (identifier: string) => Promise<boolean | undefined>;
  uninstallMCPPlugin: (identifier: string) => Promise<void>;
  useFetchMCPPluginList: (params: MCPPluginListParams) => SWRResponse<PluginListResponse>;
}

export const createMCPPluginStoreSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  PluginMCPStoreAction
> = (set, get) => ({
  installMCPPlugin: async (identifier) => {
    const plugin = mcpStoreSelectors.getPluginById(identifier)(get());

    if (!plugin || !plugin.manifestUrl) return;

    const { updateInstallLoadingState, refreshPlugins } = get();
    try {
      updateInstallLoadingState(identifier, true);
      const data = await toolService.getMCPPluginManifest(plugin.identifier, { install: true });

      console.log(data);
      const result = await mcpService.checkInstallation(data);
      let manifest: LobeChatPluginManifest | undefined;

      if (!result.success) return;

      console.log('result', result);
      if (result.connection?.type === 'stdio') {
        manifest = await mcpService.getStdioMcpServerManifest(
          {
            args: result.connection.args,
            command: result.connection.command!,
            name: identifier,
          },
          { avatar: plugin.icon, description: plugin.description },
        );
      }
      if (result.connection?.type === 'http') {
        manifest = await mcpService.getStreamableMcpServerManifest(
          identifier,
          result.connection.url!,
          { avatar: plugin.icon, description: plugin.description },
        );
      }

      if (!manifest) return;

      // 4. 存储 manifest 信息
      await pluginService.installPlugin({
        // 针对 mcp 先将 connection 信息存到 customParams 字段里
        customParams: { mcp: result.connection },
        identifier: plugin.identifier,
        manifest: manifest,
        type: 'plugin',
      });
      await refreshPlugins();

      updateInstallLoadingState(identifier, undefined);

      return true;
    } catch (error) {
      console.error(error);
      updateInstallLoadingState(identifier, undefined);

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

  useFetchMCPPluginList: (params) => {
    const locale = globalHelpers.getCurrentLanguage();

    return useSWR<PluginListResponse>(
      ['useFetchMCPPluginList', locale, ...Object.values(params)].filter(Boolean).join('-'),
      () => toolService.getMCPPluginList(params),
      {
        onSuccess(data) {
          set({
            activeMCPIdentifier: data.items?.[0]?.identifier,
            categories: data.categories,
            mcpPluginItems: data.items,
          });
        },
        revalidateOnFocus: false,
      },
    );
  },
});
