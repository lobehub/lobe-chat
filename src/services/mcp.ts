import { CURRENT_VERSION, isDesktop } from '@lobechat/const';
import { ChatToolPayload, CheckMcpInstallResult, CustomPluginMetadata } from '@lobechat/types';
import { isLocalOrPrivateUrl, safeParseJSON } from '@lobechat/utils';
import { PluginManifest } from '@lobehub/market-sdk';
import { CallReportRequest } from '@lobehub/market-types';

import { MCPToolCallResult } from '@/libs/mcp';
import { desktopClient, toolsClient } from '@/libs/trpc/client';

import { discoverService } from './discover';

/**
 * Calculate byte size of object
 * @param obj Object to calculate size of
 * @returns Byte size
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

    const connection = plugin.customParams?.mcp;
    const settingsEntries = plugin.settings
      ? Object.entries(plugin.settings as Record<string, any>).filter(
          ([, value]) => value !== undefined && value !== null,
        )
      : [];
    const pluginSettings =
      settingsEntries.length > 0
        ? settingsEntries.reduce<Record<string, unknown>>((acc, [key, value]) => {
            acc[key] = value;

            return acc;
          }, {})
        : undefined;

    const params = {
      ...connection,
      name: identifier,
    } as any;

    if (connection?.type === 'http') {
      params.headers = {
        ...connection.headers,
        ...pluginSettings,
      };
    }

    if (connection?.type === 'stdio') {
      params.env = {
        ...connection?.env,
        ...pluginSettings,
      };
    }

    const data = {
      args,
      env: connection?.type === 'stdio' ? params.env : (pluginSettings ?? connection?.env),
      params,
      toolName: apiName,
    };

    const isStdio = plugin?.customParams?.mcp?.type === 'stdio';

    // Record call start time
    const callStartTime = Date.now();
    let success = false;
    let errorCode: string | undefined;
    let errorMessage: string | undefined;
    let result: MCPToolCallResult | undefined;

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

      // Rethrow error, maintain original error handling logic
      throw error;
    } finally {
      // Asynchronously report call result without affecting main flow
      const callEndTime = Date.now();
      const callDurationMs = callEndTime - callStartTime;

      // Calculate request size
      const inputParams = safeParseJSON(args) || args;

      const requestSizeBytes = calculateObjectSizeBytes(inputParams);
      // Calculate response size
      const responseSizeBytes = success && result ? calculateObjectSizeBytes(result.state) : 0;

      const isCustomPlugin = !!customPlugin;
      // Construct report data
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

      // Asynchronously report without affecting main flow
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
    // If in Desktop mode and URL is local address, use desktopClient
    // This avoids accessing user local services through remote server in production
    if (isDesktop && isLocalOrPrivateUrl(params.url)) {
      return desktopClient.mcp.getStreamableMcpServerManifest.query(params, { signal });
    }

    // Otherwise use toolsClient (via server relay)
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
   * Check MCP plugin installation status
   * @param manifest MCP plugin manifest
   * @param signal AbortSignal for canceling request
   * @returns Installation check result
   */
  async checkInstallation(
    manifest: PluginManifest,
    signal?: AbortSignal,
  ): Promise<CheckMcpInstallResult> {
    // Pass all deployment options to main process for checking
    return desktopClient.mcp.validMcpServerInstallable.mutate(
      { deploymentOptions: manifest.deploymentOptions as any },
      { signal },
    );
  }
}

export const mcpService = new MCPService();
