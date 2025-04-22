import { toolsClient } from '@/libs/trpc/client';
import { getToolStoreState } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/slices/plugin/selectors';
import { ChatToolPayload } from '@/types/message';

class MCPService {
  async invokeMcpToolCall(payload: ChatToolPayload, { signal }: { signal?: AbortSignal }) {
    const s = getToolStoreState();
    const { identifier, arguments: args, apiName } = payload;
    const plugin = pluginSelectors.getCustomPluginById(identifier)(s);

    if (!plugin) return;

    return toolsClient.mcp.callTool.mutate(
      { args, params: { ...plugin.customParams?.mcp, name: identifier } as any, toolName: apiName },
      { signal },
    );
  }

  async getStreamableMcpServerManifest(identifier: string, url: string) {
    return toolsClient.mcp.getStreamableMcpServerManifest.query({ identifier, url });
  }
}

export const mcpService = new MCPService();
