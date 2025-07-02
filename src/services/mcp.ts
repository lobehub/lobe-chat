import { PluginManifest } from '@lobehub/market-sdk';

import { isDesktop } from '@/const/version';
import { desktopClient, edgeClient, toolsClient } from '@/libs/trpc/client';
import { ChatToolPayload } from '@/types/message';
import { CheckMcpInstallResult } from '@/types/plugins';
import { CustomPluginMetadata } from '@/types/tool/plugin';
import { cleanObject } from '@/utils/object';

class MCPService {
  async invokeMcpToolCall(payload: ChatToolPayload, { signal }: { signal?: AbortSignal }) {
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
      env: plugin.settings,
      params: { ...plugin.customParams?.mcp, name: identifier } as any,
      toolName: apiName,
    };

    const isStdio = plugin?.customParams?.mcp?.type === 'stdio';

    // For desktop and stdio, use the desktopClient
    if (isDesktop && isStdio) {
      return desktopClient.mcp.callTool.mutate(data, { signal });
    }

    return toolsClient.mcp.callTool.mutate(data, { signal });
  }

  async getStreamableMcpServerManifest(
    identifier: string,
    url: string,
    metadata?: CustomPluginMetadata,
    signal?: AbortSignal,
  ) {
    return toolsClient.mcp.getStreamableMcpServerManifest.query(
      { identifier, metadata, url },
      { signal },
    );
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

  /**
   * 上报 MCP 插件安装结果
   */
  reportMcpInstallResult = ({
    success,
    manifest,
    errorMessage,
    errorCode,
    ...params
  }: {
    errorCode?: string;
    errorMessage?: string;
    identifier: string;
    installDurationMs?: number;
    manifest?: any;
    metadata?: any;
    platform: string;
    success: boolean;
    version: string;
  }) => {
    const reportData = {
      errorCode: success ? undefined : errorCode,
      errorMessage: success ? undefined : errorMessage,
      manifest: success ? manifest : undefined,
      success,
      ...params,
    };

    edgeClient.market.reportMcpInstallResult
      .mutate(cleanObject(reportData))
      .catch((reportError) => {
        console.warn('Failed to report MCP installation result:', reportError);
      });
  };
}

export const mcpService = new MCPService();
