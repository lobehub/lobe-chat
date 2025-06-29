import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { PluginListResponse } from '@lobehub/market-sdk';
import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { mcpService } from '@/services/mcp';
import { pluginService } from '@/services/plugin';
import { toolService } from '@/services/tool';
import { globalHelpers } from '@/store/global/helpers';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { MCPPluginListParams } from '@/types/plugins';
import { sleep } from '@/utils/sleep';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { MCPInstallProgress, MCPInstallStep, MCPStoreState } from './initialState';

const n = setNamespace('mcpStore');

export interface PluginMCPStoreAction {
  installMCPPlugin: (identifier: string) => Promise<boolean | undefined>;
  uninstallMCPPlugin: (identifier: string) => Promise<void>;
  updateMCPInstallProgress: (identifier: string, progress: MCPInstallProgress | undefined) => void;
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

    const { updateInstallLoadingState, refreshPlugins, updateMCPInstallProgress } = get();

    // 记录安装开始时间
    const installStartTime = Date.now();

    try {
      // 步骤 1: 获取插件清单
      updateMCPInstallProgress(identifier, {
        progress: 20,
        step: MCPInstallStep.FETCHING_MANIFEST,
      });

      updateInstallLoadingState(identifier, true);
      const data = await toolService.getMCPPluginManifest(plugin.identifier, { install: true });

      // 步骤 2: 检查安装环境
      updateMCPInstallProgress(identifier, {
        progress: 40,
        step: MCPInstallStep.CHECKING_INSTALLATION,
      });

      const result = await mcpService.checkInstallation(data);
      let manifest: LobeChatPluginManifest | undefined;

      if (!result.success) {
        updateMCPInstallProgress(identifier, undefined);
        return;
      }

      // 步骤 3: 获取服务器清单
      updateMCPInstallProgress(identifier, {
        progress: 60,
        step: MCPInstallStep.GETTING_SERVER_MANIFEST,
      });

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

      if (!manifest) {
        updateMCPInstallProgress(identifier, undefined);
        return;
      }

      // 步骤 4: 安装插件
      updateMCPInstallProgress(identifier, {
        progress: 80,
        step: MCPInstallStep.INSTALLING_PLUGIN,
      });

      await pluginService.installPlugin({
        // 针对 mcp 先将 connection 信息存到 customParams 字段里
        customParams: { mcp: result.connection },
        identifier: plugin.identifier,
        manifest: manifest,
        type: 'plugin',
      });

      await refreshPlugins();

      // 步骤 5: 完成安装
      updateMCPInstallProgress(identifier, {
        progress: 100,
        step: MCPInstallStep.COMPLETED,
      });

      // 计算安装持续时间
      const installDurationMs = Date.now() - installStartTime;

      mcpService.reportMcpInstallResult({
        identifier: plugin.identifier,
        installDurationMs,
        manifest: {
          prompts: (manifest as any).prompts,
          resources: (manifest as any).resources,
          tools: (manifest as any).tools,
        },
        success: true,
        version: data.version,
      });

      // 短暂显示完成状态后清除进度
      await sleep(1000);

      updateMCPInstallProgress(identifier, undefined);
      updateInstallLoadingState(identifier, undefined);

      return true;
    } catch (error) {
      console.error(error);

      // 计算安装持续时间（失败情况）
      const installDurationMs = Date.now() - installStartTime;

      // 上报安装失败结果
      mcpService.reportMcpInstallResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        identifier: plugin.identifier,
        installDurationMs,
        success: false,
      });

      updateInstallLoadingState(identifier, undefined);
      updateMCPInstallProgress(identifier, undefined);
    }
  },
  uninstallMCPPlugin: async (identifier) => {
    await pluginService.uninstallPlugin(identifier);
    await get().refreshPlugins();
  },

  updateMCPInstallProgress: (identifier, progress) => {
    set(
      produce((draft: MCPStoreState) => {
        draft.mcpInstallProgress[identifier] = progress;
      }),
      false,
      n(`updateMCPInstallProgress/${progress?.step || 'clear'}`),
    );
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
