import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { PluginItem, PluginListResponse } from '@lobehub/market-sdk';
import { TRPCClientError } from '@trpc/client';
import { produce } from 'immer';
import { uniqBy } from 'lodash-es';
import { gt, valid } from 'semver';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { CURRENT_VERSION } from '@/const/version';
import { MCPErrorData } from '@/libs/mcp/types';
import { discoverService } from '@/services/discover';
import { mcpService } from '@/services/mcp';
import { pluginService } from '@/services/plugin';
import { globalHelpers } from '@/store/global/helpers';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import {
  CheckMcpInstallResult,
  MCPErrorInfo,
  MCPInstallProgress,
  MCPPluginListParams,
} from '@/types/plugins';
import { sleep } from '@/utils/sleep';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { MCPInstallStep, MCPStoreState } from './initialState';

const n = setNamespace('mcpStore');

export interface PluginMCPStoreAction {
  cancelInstallMCPPlugin: (identifier: string) => Promise<void>;
  installMCPPlugin: (
    identifier: string,
    options?: { config?: Record<string, any>; resume?: boolean; skipDepsCheck?: boolean },
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
  cancelInstallMCPPlugin: async (identifier) => {
    // 获取并取消AbortController
    const abortController = get().mcpInstallAbortControllers[identifier];
    if (abortController) {
      abortController.abort();

      // 清理AbortController存储
      set(
        produce((draft: MCPStoreState) => {
          delete draft.mcpInstallAbortControllers[identifier];
        }),
        false,
        n('cancelInstallMCPPlugin/clearController'),
      );
    }

    // 清理安装进度和加载状态
    get().updateMCPInstallProgress(identifier, undefined);
    get().updateInstallLoadingState(identifier, undefined);
  },

  installMCPPlugin: async (identifier, options = {}) => {
    const { resume = false, config, skipDepsCheck } = options;
    let plugin = mcpStoreSelectors.getPluginById(identifier)(get());

    if (!plugin || !plugin.manifestUrl) {
      const data = await discoverService.getMcpDetail({ identifier });
      if (!data) return;

      plugin = data as unknown as PluginItem;
    }

    if (!plugin) return;

    const { updateInstallLoadingState, refreshPlugins, updateMCPInstallProgress } = get();

    // 创建AbortController用于取消安装
    const abortController = new AbortController();

    // 存储AbortController
    set(
      produce((draft: MCPStoreState) => {
        draft.mcpInstallAbortControllers[identifier] = abortController;
      }),
      false,
      n('installMCPPlugin/setController'),
    );

    // 记录安装开始时间
    const installStartTime = Date.now();

    let data: any;
    let result: CheckMcpInstallResult | undefined;
    let connection: any;
    const userAgent = `LobeHub Desktop/${CURRENT_VERSION}`;

    try {
      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return;
      }

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
        result = configInfo.checkResult;
        connection = configInfo.connection;
      } else {
        // 正常模式：从头开始安装

        // 步骤 1: 获取插件清单
        updateMCPInstallProgress(identifier, {
          progress: 15,
          step: MCPInstallStep.FETCHING_MANIFEST,
        });

        updateInstallLoadingState(identifier, true);

        // 检查是否已被取消
        if (abortController.signal.aborted) {
          return;
        }

        data = await discoverService.getMCPPluginManifest(plugin.identifier, {
          install: true,
        });

        // 步骤 2: 检查安装环境
        updateMCPInstallProgress(identifier, {
          progress: 30,
          step: MCPInstallStep.CHECKING_INSTALLATION,
        });

        // 检查是否已被取消
        if (abortController.signal.aborted) {
          return;
        }

        result = await mcpService.checkInstallation(data, abortController.signal);

        if (!result.success) {
          updateMCPInstallProgress(identifier, undefined);
          return;
        }

        // 步骤 3: 检查系统依赖是否满足
        if (!skipDepsCheck && !result.allDependenciesMet) {
          // 依赖不满足，暂停安装流程并显示依赖安装引导
          updateMCPInstallProgress(identifier, {
            connection: result.connection,
            manifest: data,
            progress: 40,
            step: MCPInstallStep.DEPENDENCIES_REQUIRED,
            systemDependencies: result.systemDependencies,
          });

          // 暂停安装流程，等待用户安装依赖
          updateInstallLoadingState(identifier, undefined);
          return false; // 返回 false 表示需要安装依赖
        }

        // 步骤 4: 检查是否需要配置
        if (result.needsConfig) {
          // 需要配置，暂停安装流程
          updateMCPInstallProgress(identifier, {
            checkResult: result,
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

      // 获取服务器清单逻辑
      updateInstallLoadingState(identifier, true);

      // 步骤 5: 获取服务器清单
      updateMCPInstallProgress(identifier, {
        progress: 70,
        step: MCPInstallStep.GETTING_SERVER_MANIFEST,
      });

      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return;
      }

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
          abortController.signal,
        );
      }
      if (connection?.type === 'http') {
        manifest = await mcpService.getStreamableMcpServerManifest(
          identifier,
          connection.url!,
          {
            avatar: plugin.icon,
            description: plugin.description,
          },
          abortController.signal,
        );
      }

      // set version
      if (manifest) {
        // set Version - 使用 semver 比较版本号并取更大的值
        const dataVersion = data?.version;
        const manifestVersion = manifest.version;

        if (dataVersion && manifestVersion) {
          // 如果两个版本都存在，比较并取更大的值
          if (valid(dataVersion) && valid(manifestVersion)) {
            manifest.version = gt(dataVersion, manifestVersion) ? dataVersion : manifestVersion;
          } else {
            // 如果版本号格式不正确，优先使用 dataVersion
            manifest.version = dataVersion;
          }
        } else {
          // 如果只有一个版本存在，使用存在的版本
          manifest.version = dataVersion || manifestVersion;
        }
      }

      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return;
      }

      if (!manifest) {
        updateMCPInstallProgress(identifier, undefined);
        return;
      }

      // 步骤 6: 安装插件
      updateMCPInstallProgress(identifier, {
        progress: 90,
        step: MCPInstallStep.INSTALLING_PLUGIN,
      });

      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return;
      }

      await pluginService.installPlugin({
        // 针对 mcp 先将 connection 信息存到 customParams 字段里
        customParams: { mcp: connection },
        identifier: plugin.identifier,
        manifest: manifest,
        settings: config,
        type: 'plugin',
      });

      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return;
      }

      await refreshPlugins();

      // 步骤 7: 完成安装
      updateMCPInstallProgress(identifier, {
        progress: 100,
        step: MCPInstallStep.COMPLETED,
      });

      // 计算安装持续时间
      const installDurationMs = Date.now() - installStartTime;

      discoverService.reportMcpInstallResult({
        identifier: plugin.identifier,
        installDurationMs,
        installParams: connection,
        manifest: {
          prompts: (manifest as any).prompts,
          resources: (manifest as any).resources,
          tools: (manifest as any).tools,
        },
        platform: result!.platform,
        success: true,
        userAgent,
        version: manifest.version || data.version,
      });

      // 短暂显示完成状态后清除进度
      await sleep(1000);

      updateMCPInstallProgress(identifier, undefined);
      updateInstallLoadingState(identifier, undefined);

      // 清理AbortController
      set(
        produce((draft: MCPStoreState) => {
          delete draft.mcpInstallAbortControllers[identifier];
        }),
        false,
        n('installMCPPlugin/clearController'),
      );

      return true;
    } catch (e) {
      // 如果是因为取消导致的错误，静默处理
      if (abortController.signal.aborted) {
        console.log('MCP plugin installation cancelled for:', identifier);
        return;
      }

      const error = e as TRPCClientError<any>;

      console.error('MCP plugin installation failed:', error);

      // 计算安装持续时间（失败情况）
      const installDurationMs = Date.now() - installStartTime;

      // 处理结构化错误信息
      let errorInfo: MCPErrorInfo;

      // 如果是结构化的 MCPError
      if (!!error.data && 'errorData' in error.data) {
        const mcpError = error.data.errorData as MCPErrorData;

        errorInfo = {
          message: mcpError.message,
          metadata: mcpError.metadata,
          type: mcpError.type,
        };
      } else {
        // 兜底处理普通错误
        const errorMessage = error instanceof Error ? error.message : String(error);
        errorInfo = {
          message: errorMessage,
          metadata: {
            step: 'installation_error',
            timestamp: Date.now(),
          },
          type: 'UNKNOWN_ERROR',
        };
      }

      // 设置错误状态，显示结构化错误信息
      updateMCPInstallProgress(identifier, {
        errorInfo,
        progress: 0,
        step: MCPInstallStep.ERROR,
      });

      // 上报安装失败结果
      discoverService.reportMcpInstallResult({
        errorCode: errorInfo.type,
        errorMessage: errorInfo.message,
        identifier: plugin.identifier,
        installDurationMs,
        installParams: connection,
        metadata: errorInfo.metadata,
        platform: result!.platform,
        success: false,
        userAgent,
        version: data?.version,
      });

      updateInstallLoadingState(identifier, undefined);

      // 清理AbortController
      set(
        produce((draft: MCPStoreState) => {
          delete draft.mcpInstallAbortControllers[identifier];
        }),
        false,
        n('installMCPPlugin/clearController'),
      );
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
      () => discoverService.getMCPPluginList(params),
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
