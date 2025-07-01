import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { PluginListResponse } from '@lobehub/market-sdk';
import { produce } from 'immer';
import { uniqBy } from 'lodash-es';
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
  installMCPPlugin: (
    identifier: string,
    options?: { config?: Record<string, any>; resume?: boolean },
  ) => Promise<boolean | undefined>;
  loadMoreMCPPlugins: () => void;
  resetMCPPluginList: (keywords?: string) => void;
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
  installMCPPlugin: async (identifier, options = {}) => {
    const { resume = false, config } = options;
    const plugin = mcpStoreSelectors.getPluginById(identifier)(get());

    if (!plugin || !plugin.manifestUrl) return;

    const { updateInstallLoadingState, refreshPlugins, updateMCPInstallProgress } = get();

    // 记录安装开始时间
    const installStartTime = Date.now();

    let data: any;

    try {
      let result: any;
      let connection: any;

      if (resume) {
        // 恢复模式：从存储中获取之前的信息
        const configInfo = get().mcpInstallProgress[identifier];
        if (!configInfo) {
          console.error('No config info found for resume');
          return;
        }

        data = configInfo.manifest;
        connection = {
          ...configInfo.connection,
          config, // 合并用户提供的配置
        };
      } else {
        // 正常模式：从头开始安装

        // 步骤 1: 获取插件清单
        updateMCPInstallProgress(identifier, {
          progress: 20,
          step: MCPInstallStep.FETCHING_MANIFEST,
        });

        updateInstallLoadingState(identifier, true);
        data = await toolService.getMCPPluginManifest(plugin.identifier, { install: true });

        // 步骤 2: 检查安装环境
        updateMCPInstallProgress(identifier, {
          progress: 30,
          step: MCPInstallStep.CHECKING_INSTALLATION,
        });

        result = await mcpService.checkInstallation(data);

        if (!result.success) {
          updateMCPInstallProgress(identifier, undefined);
          return;
        }

        // 步骤 3: 检查是否需要配置
        if (result.needsConfig) {
          // 需要配置，暂停安装流程
          updateMCPInstallProgress(identifier, {
            configSchema: result.configSchema,
            connection: result.connection,
            manifest: data,
            needsConfig: true,
            progress: 50,
            step: MCPInstallStep.CONFIGURATION_REQUIRED,
          });

          // 暂停安装流程，等待用户配置
          updateInstallLoadingState(identifier, undefined);
          return false; // 返回 false 表示需要配置
        }

        connection = result.connection;
      }

      // 共同的获取服务器清单逻辑
      updateInstallLoadingState(identifier, true);

      // 步骤 4: 获取服务器清单
      updateMCPInstallProgress(identifier, {
        progress: 70,
        step: MCPInstallStep.GETTING_SERVER_MANIFEST,
      });

      let manifest: LobeChatPluginManifest | undefined;

      if (connection?.type === 'stdio') {
        manifest = await mcpService.getStdioMcpServerManifest(
          {
            args: connection.args,
            command: connection.command!,
            env: config,
            name: identifier, // 将配置作为环境变量传递（resume 模式下）
          },
          { avatar: plugin.icon, description: plugin.description, name: data.name },
        );
      }
      if (connection?.type === 'http') {
        manifest = await mcpService.getStreamableMcpServerManifest(identifier, connection.url!, {
          avatar: plugin.icon,
          description: plugin.description,
        });
      }

      if (!manifest) {
        updateMCPInstallProgress(identifier, undefined);
        return;
      }

      // 步骤 5: 安装插件
      updateMCPInstallProgress(identifier, {
        progress: 90,
        step: MCPInstallStep.INSTALLING_PLUGIN,
      });

      await pluginService.installPlugin({
        // 针对 mcp 先将 connection 信息存到 customParams 字段里
        customParams: { mcp: connection },
        identifier: plugin.identifier,
        manifest: manifest,
        settings: config,
        type: 'plugin',
      });

      await refreshPlugins();

      // 步骤 6: 完成安装
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
        version: data.version,
      });

      updateInstallLoadingState(identifier, undefined);
      updateMCPInstallProgress(identifier, undefined);
    }
  },

  loadMoreMCPPlugins: () => {
    const { mcpPluginItems, totalCount, currentPage } = get();

    // 检查是否还有更多数据可以加载
    if (mcpPluginItems.length < (totalCount || 0)) {
      set(
        produce((draft: MCPStoreState) => {
          draft.currentPage = currentPage + 1;
        }),
        false,
        n('loadMoreMCPPlugins'),
      );
    }
  },

  resetMCPPluginList: (keywords) => {
    set(
      produce((draft: MCPStoreState) => {
        draft.mcpPluginItems = [];
        draft.currentPage = 1;
        draft.mcpSearchKeywords = keywords;
      }),
      false,
      n('resetMCPPluginList'),
    );
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
          set(
            produce((draft: MCPStoreState) => {
              draft.searchLoading = false;

              // 设置基础信息
              if (!draft.isMcpListInit) {
                draft.activeMCPIdentifier = data.items?.[0]?.identifier;

                draft.isMcpListInit = true;
                draft.categories = data.categories;
                draft.totalCount = data.totalCount;
                draft.totalPages = data.totalPages;
              }

              // 累积数据逻辑
              if (params.page === 1) {
                // 第一页，直接设置
                draft.mcpPluginItems = uniqBy(data.items, 'identifier');
              } else {
                // 后续页面，累积数据
                draft.mcpPluginItems = uniqBy(
                  [...draft.mcpPluginItems, ...data.items],
                  'identifier',
                );
              }
            }),
            false,
            n('useFetchMCPPluginList/onSuccess'),
          );
        },
        revalidateOnFocus: false,
      },
    );
  },
});
