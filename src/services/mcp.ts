import { isDesktop } from '@/const/version';
import { desktopClient, toolsClient } from '@/libs/trpc/client';
import { ChatToolPayload } from '@/types/message';
import { CustomPluginMetadata } from '@/types/tool/plugin';

class MCPService {
  async invokeMcpToolCall(payload: ChatToolPayload, { signal }: { signal?: AbortSignal }) {
    const { pluginSelectors } = await import('@/store/tool/selectors');
    const { getToolStoreState } = await import('@/store/tool/store');

    const s = getToolStoreState();
    const { identifier, arguments: args, apiName } = payload;

    const plugin = pluginSelectors.getCustomPluginById(identifier)(s);

    if (!plugin) return;

    const data = {
      args,
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
  ) {
    return toolsClient.mcp.getStreamableMcpServerManifest.query({ identifier, metadata, url });
  }

  async getStdioMcpServerManifest(
    identifier: string,
    command: string,
    args?: string[],
    metadata?: CustomPluginMetadata,
  ) {
    return desktopClient.mcp.getStdioMcpServerManifest.query({
      args: args,
      command,
      metadata,
      name: identifier,
    });
  }
}

export const mcpService = new MCPService();
