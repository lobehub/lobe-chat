import { isDesktop } from '@/const/version';
import { desktopClient, toolsClient } from '@/libs/trpc/client';
import { ChatToolPayload } from '@/types/message';

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

  async getStreamableMcpServerManifest(identifier: string, url: string) {
    return toolsClient.mcp.getStreamableMcpServerManifest.query({ identifier, url });
  }

  async getStdioMcpServerManifest(identifier: string, command: string, args?: string[]) {
    return desktopClient.mcp.getStdioMcpServerManifest.query({
      args: args,
      command,
      name: identifier,
    });
  }
}

export const mcpService = new MCPService();
