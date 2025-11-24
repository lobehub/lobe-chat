import { CURRENT_VERSION, isDesktop } from '@lobechat/const';
import { ChatToolPayload, CheckMcpInstallResult, CustomPluginMetadata } from '@lobechat/types';
import { isLocalOrPrivateUrl, safeParseJSON } from '@lobechat/utils';
import { PluginManifest } from '@lobehub/market-sdk';
import { CallReportRequest } from '@lobehub/market-types';

import { desktopClient, toolsClient } from '@/libs/trpc/client';

import { discoverService } from './discover';

/**
 * 计算对象的字节大小
 * @param obj 要计算大小的对象
 * @returns 字节大小
 */
function calculateObjectSizeBytes(obj: any): number {
  try {
    const jsonString = JSON.stringify(obj);
    return new TextEncoder().encode(jsonString).length;
  } catch (error) {
    console.warn('Failed to calculate object size:', error);
    return 0;
  }
}

class MCPService {
  async invokeMcpToolCall(
    payload: ChatToolPayload,
    { signal, topicId }: { signal?: AbortSignal; topicId?: string },
  ) {
    const { pluginSelectors } = await import('@/store/tool/selectors');
    const { getToolStoreState } = await import('@/store/tool/store');

    const s = getToolStoreState();
    const { identifier, arguments: args, apiName } = payload;

    const installPlugin = pluginSelectors.getInstalledPluginById(identifier)(s);
    const customPlugin = pluginSelectors.getCustomPluginById(identifier)(s);

    const plugin = installPlugin || customPlugin;

    if (!plugin) return;

    const data = {
      args,
      env: plugin.settings || plugin.customParams?.mcp?.env,
      params: { ...plugin.customParams?.mcp, name: identifier } as any,
      toolName: apiName,
    };

    const isStdio = plugin?.customParams?.mcp?.type === 'stdio';

    // 记录调用开始时间
    const callStartTime = Date.now();
    let success = false;
    let errorCode: string | undefined;
    let errorMessage: string | undefined;
    let result: any;

    try {
      // For desktop and stdio, use the desktopClient
      if (isDesktop && isStdio) {
        result = await desktopClient.mcp.callTool.mutate(data, { signal });
      } else {
        result = await toolsClient.mcp.callTool.mutate(data, { signal });
      }

      success = true;
      return result;
    } catch (error) {
      success = false;
      const err = error as Error;
      errorCode = 'CALL_FAILED';
      errorMessage = err.message;

      // 重新抛出错误，保持原有的错误处理逻辑
      throw error;
    } finally {
      // 异步上报调用结果，不影响主流程
      const callEndTime = Date.now();
      const callDurationMs = callEndTime - callStartTime;

      // 计算请求大小
      const inputParams = safeParseJSON(args) || args;

      const requestSizeBytes = calculateObjectSizeBytes(inputParams);
      // 计算响应大小
      const responseSizeBytes = success ? calculateObjectSizeBytes(result) : 0;

      const isCustomPlugin = !!customPlugin;
      // 构造上报数据
      const reportData: CallReportRequest = {
        callDurationMs,
        customPluginInfo: isCustomPlugin
          ? {
              avatar: plugin.manifest?.meta.avatar,
              description: plugin.manifest?.meta.description,
              name: plugin.manifest?.meta.title,
            }
          : undefined,
        errorCode,
        errorMessage,
        identifier,
        isCustomPlugin,
        metadata: {
          appVersion: CURRENT_VERSION,
          command: plugin.customParams?.mcp?.command,
          mcpType: plugin.customParams?.mcp?.type,
        },
        methodName: apiName,
        methodType: 'tool' as const,
        requestSizeBytes,
        responseSizeBytes,
        sessionId: topicId,
        success,
        version: plugin.manifest!.version || 'unknown',
      };

      // 异步上报，不影响主流程
      discoverService.reportPluginCall(reportData).catch((reportError) => {
        console.warn('Failed to report MCP tool call:', reportError);
      });
    }
  }

  async getStreamableMcpServerManifest(
    params: {
      auth?: {
        accessToken?: string;
        token?: string;
        type: 'none' | 'bearer' | 'oauth2';
      };
      headers?: Record<string, string>;
      identifier: string;
      metadata?: CustomPluginMetadata;
      url: string;
    },
    signal?: AbortSignal,
  ) {
    // 如果是 Desktop 模式且 URL 是本地地址，使用 desktopClient
    // 这样可以避免在生产环境中通过远程服务器访问用户本地服务
    if (isDesktop && isLocalOrPrivateUrl(params.url)) {
      return desktopClient.mcp.getStreamableMcpServerManifest.query(params, { signal });
    }

    // 否则使用 toolsClient（通过服务器中转）
    return toolsClient.mcp.getStreamableMcpServerManifest.query(params, { signal });
  }

  async getStdioMcpServerManifest(
    stdioParams: {
      args?: string[];
      command: string;
      env?: Record<string, string>;
      name: string;
    },
    metadata?: CustomPluginMetadata,
    signal?: AbortSignal,
  ) {
    return desktopClient.mcp.getStdioMcpServerManifest.query(
      { ...stdioParams, metadata },
      { signal },
    );
  }

  /**
   * 检查 MCP 插件安装状态
   * @param manifest MCP 插件清单
   * @param signal AbortSignal 用于取消请求
   * @returns 安装检测结果
   */
  async checkInstallation(
    manifest: PluginManifest,
    signal?: AbortSignal,
  ): Promise<CheckMcpInstallResult> {
    // 将所有部署选项传递给主进程进行检查
    return desktopClient.mcp.validMcpServerInstallable.mutate(
      { deploymentOptions: manifest.deploymentOptions as any },
      { signal },
    );
  }
}

export const mcpService = new MCPService();
