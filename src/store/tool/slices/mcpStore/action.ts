import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { PluginItem, PluginListResponse } from '@lobehub/market-sdk';
import { TRPCClientError } from '@trpc/client';
import debug from 'debug';
import { produce } from 'immer';
import { uniqBy } from 'lodash-es';
import { gt, valid } from 'semver';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { CURRENT_VERSION, isDesktop } from '@lobechat/const';
import { MCPErrorData } from '@/libs/mcp/types';
import { discoverService } from '@/services/discover';
import { mcpService } from '@/services/mcp';
import { pluginService } from '@/services/plugin';
import { globalHelpers } from '@/store/global/helpers';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { McpConnectionType } from '@/types/discover';
import {
  CheckMcpInstallResult,
  MCPErrorInfo,
  MCPInstallProgress,
  MCPInstallStep,
  MCPPluginListParams,
  McpConnectionParams,
} from '@/types/plugins';
import { sleep } from '@/utils/sleep';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { MCPStoreState } from './initialState';

const log = debug('lobe-mcp:store:action');

const n = setNamespace('mcpStore');

const doesConfigSchemaRequireInput = (configSchema?: any) => {
  if (!configSchema) return false;

  const hasRequiredArray =
    Array.isArray(configSchema.required) && configSchema.required.some(Boolean);

  const hasRequiredProperty =
    !!configSchema.properties &&
    Object.values(configSchema.properties).some(
      (property: any) => property && property.required === true,
    );

  return hasRequiredArray || hasRequiredProperty;
};

const toNonEmptyStringRecord = (input?: Record<string, any>) => {
  if (!input) return undefined;

  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined && value !== null,
  );

  if (entries.length === 0) return undefined;

  return entries.reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = typeof value === 'string' ? value : String(value);

    return acc;
  }, {});
};

// 测试连接结果类型
export interface TestMcpConnectionResult {
  error?: string;
  manifest?: LobeChatPluginManifest;
  success: boolean;
}

export interface PluginMCPStoreAction {
  cancelInstallMCPPlugin: (identifier: string) => Promise<void>;
  cancelMcpConnectionTest: (identifier: string) => void;
  installMCPPlugin: (
    identifier: string,
    options?: { config?: Record<string, any>; resume?: boolean; skipDepsCheck?: boolean },
  ) => Promise<boolean | undefined>;
  loadMoreMCPPlugins: () => void;
  resetMCPPluginList: (keywords?: string) => void;
  // 测试连接相关方法
  testMcpConnection: (params: McpConnectionParams) => Promise<TestMcpConnectionResult>;
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

  // 取消 MCP 连接测试
  cancelMcpConnectionTest: (identifier) => {
    const abortController = get().mcpTestAbortControllers[identifier];
    if (abortController) {
      abortController.abort();

      // 清理状态
      set(
        produce((draft: MCPStoreState) => {
          draft.mcpTestLoading[identifier] = false;
          delete draft.mcpTestAbortControllers[identifier];
          delete draft.mcpTestErrors[identifier];
        }),
        false,
        n('cancelMcpConnectionTest'),
      );
    }
  },

  installMCPPlugin: async (identifier, options = {}) => {
    const { resume = false, config, skipDepsCheck } = options;
    const normalizedConfig = toNonEmptyStringRecord(config);
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
        connection = configInfo.connection ? { ...configInfo.connection } : undefined;
        result = configInfo.checkResult;
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

        const deploymentOptions: any[] = Array.isArray(data.deploymentOptions)
          ? data.deploymentOptions
          : [];

        const httpOption = deploymentOptions.find(
          (option) => option?.connection?.url && option?.connection?.type === 'http',
        ) ||
          deploymentOptions.find(
            (option) => option?.connection?.url && !option?.connection?.type,
          );

        const hasNonHttpDeployment = deploymentOptions.some((option) => {
          const type = option?.connection?.type;
          if (!type && option?.connection?.url) return false;

          return type && type !== 'http';
        });

        const shouldUseHttpDeployment = !!httpOption && (!hasNonHttpDeployment || !isDesktop);

        if (shouldUseHttpDeployment && httpOption) {
          // ✅ HTTP 类型：跳过系统依赖检查，直接使用 URL
          log('HTTP MCP detected, skipping system dependency check');

          connection = {
            auth: httpOption.connection?.auth || { type: 'none' },
            headers: httpOption.connection?.headers,
            type: 'http',
            url: httpOption.connection?.url,
          };

          log('Using HTTP connection: %O', { type: connection.type, url: connection.url });

          const configSchema = httpOption.connection?.configSchema;
          const needsConfig = doesConfigSchemaRequireInput(configSchema);

          if (needsConfig && !normalizedConfig) {
            updateMCPInstallProgress(identifier, {
              configSchema,
              connection,
              manifest: data,
              needsConfig: true,
              progress: 50,
              step: MCPInstallStep.CONFIGURATION_REQUIRED,
            });

            updateInstallLoadingState(identifier, undefined);
            return false;
          }
        } else {
          // ❌ stdio 类型：需要完整的系统依赖检查流程

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
      }

      let mergedHttpHeaders: Record<string, string> | undefined;
      let mergedStdioEnv: Record<string, string> | undefined;

      if (connection?.type === 'http') {
        const baseHeaders = toNonEmptyStringRecord(connection.headers);

        if (baseHeaders || normalizedConfig) {
          mergedHttpHeaders = {
            ...baseHeaders,
            ...normalizedConfig,
          };
        }
      }

      if (connection?.type === 'stdio') {
        const baseEnv = toNonEmptyStringRecord(connection.env);

        if (baseEnv || normalizedConfig) {
          mergedStdioEnv = {
            ...baseEnv,
            ...normalizedConfig,
          };
        }
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
            env: mergedStdioEnv,
            name: identifier, // 将配置作为环境变量传递（resume 模式下）
          },
          { avatar: plugin.icon, description: plugin.description, name: data.name },
          abortController.signal,
        );
      }
      if (connection?.type === 'http') {
        manifest = await mcpService.getStreamableMcpServerManifest(
          {
            auth: connection.auth,
            headers: mergedHttpHeaders,
            identifier,
            metadata: {
              avatar: plugin.icon,
              description: plugin.description,
            },
            url: connection.url!,
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
        settings: normalizedConfig,
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
        platform: result?.platform || process.platform,
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
        platform: result?.platform || process.platform,
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

  // 测试 MCP 连接
  testMcpConnection: async (params) => {
    const { identifier, connection, metadata } = params;

    // 创建 AbortController 用于取消测试
    const abortController = new AbortController();

    // 存储 AbortController 并设置加载状态
    set(
      produce((draft: MCPStoreState) => {
        draft.mcpTestAbortControllers[identifier] = abortController;
        draft.mcpTestLoading[identifier] = true;
        draft.mcpTestErrors[identifier] = '';
      }),
      false,
      n('testMcpConnection/start'),
    );

    try {
      let manifest: LobeChatPluginManifest;

      if (connection.type === 'http') {
        if (!connection.url) {
          throw new Error('URL is required for HTTP connection');
        }

        manifest = await mcpService.getStreamableMcpServerManifest(
          {
            auth: connection.auth,
            headers: connection.headers,
            identifier,
            metadata,
            url: connection.url,
          },
          abortController.signal,
        );
      } else if (connection.type === 'stdio') {
        if (!connection.command) {
          throw new Error('Command is required for STDIO connection');
        }

        manifest = await mcpService.getStdioMcpServerManifest(
          {
            args: connection.args,
            command: connection.command,
            env: connection.env,
            name: identifier,
          },
          metadata,
          abortController.signal,
        );
      } else {
        throw new Error('Invalid MCP connection type');
      }

      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return { error: 'Test cancelled', success: false };
      }

      // 清理状态
      set(
        produce((draft: MCPStoreState) => {
          draft.mcpTestLoading[identifier] = false;
          delete draft.mcpTestAbortControllers[identifier];
          delete draft.mcpTestErrors[identifier];
        }),
        false,
        n('testMcpConnection/success'),
      );

      return { manifest, success: true };
    } catch (error) {
      // 如果是因为取消导致的错误，静默处理
      if (abortController.signal.aborted) {
        return { error: 'Test cancelled', success: false };
      }

      const errorMessage = error instanceof Error ? error.message : String(error);

      // 设置错误状态
      set(
        produce((draft: MCPStoreState) => {
          draft.mcpTestLoading[identifier] = false;
          draft.mcpTestErrors[identifier] = errorMessage;
          delete draft.mcpTestAbortControllers[identifier];
        }),
        false,
        n('testMcpConnection/error'),
      );

      return { error: errorMessage, success: false };
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
    const requestParams = isDesktop ? params : { ...params, connectionType: McpConnectionType.http };
    const swrKeyParts = [
      'useFetchMCPPluginList',
      locale,
      requestParams.page,
      requestParams.pageSize,
      requestParams.q,
      requestParams.connectionType,
    ];
    const swrKey = swrKeyParts.filter((part) => part !== undefined && part !== null && part !== '')
      .join('-');
    const page = requestParams.page ?? 1;

    return useSWR<PluginListResponse>(
      swrKey,
      () => discoverService.getMCPPluginList(requestParams),
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
              if (page === 1) {
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
