import { isKlavisEnabled } from '@/config/klavis';

import { ToolStore } from '../../store';
import { KlavisServer, KlavisServerStatus } from './types';

/**
 * Klavis Store Selectors
 */
export const klavisStoreSelectors = {
  /**
   * 获取所有 Klavis 服务器
   */
  getServers: (s: ToolStore): KlavisServer[] => s.servers || [],

  /**
   * 根据服务器名称获取服务器
   */
  getServerByName: (serverName: string) => (s: ToolStore) =>
    s.servers?.find((server) => server.serverName === serverName),

  /**
   * 获取所有已连接的服务器
   */
  getConnectedServers: (s: ToolStore): KlavisServer[] =>
    (s.servers || []).filter((server) => server.status === KlavisServerStatus.CONNECTED),

  /**
   * 获取所有待认证的服务器
   */
  getPendingAuthServers: (s: ToolStore): KlavisServer[] =>
    (s.servers || []).filter((server) => server.status === KlavisServerStatus.PENDING_AUTH),

  /**
   * 检查 Klavis 是否已启用
   * 基于 NEXT_PUBLIC_KLAVIS_ENABLE 环境变量或服务端 KLAVIS_API_KEY 是否存在
   */
  isKlavisEnabled: (): boolean => isKlavisEnabled(),

  /**
   * 获取所有可用的工具（来自所有已连接的服务器）
   */
  getAllTools: (s: ToolStore) => {
    const connectedServers = klavisStoreSelectors.getConnectedServers(s);
    return connectedServers.flatMap((server) =>
      (server.tools || []).map((tool) => ({
        ...tool,
        serverName: server.serverName,
      })),
    );
  },

  /**
   * 检查服务器是否正在加载
   */
  isServerLoading: (serverName: string) => (s: ToolStore) =>
    s.loadingServerIds?.has(serverName) || false,

  /**
   * 检查工具是否正在执行
   */
  isToolExecuting: (serverName: string, toolName: string) => (s: ToolStore) => {
    const toolId = `${serverName}:${toolName}`;
    return s.executingToolIds?.has(toolId) || false;
  },

  /**
   * Get all Klavis tools as LobeTool format for agent use
   * Converts Klavis tools into the format expected by ToolNameResolver
   */
  klavisAsLobeTools: (s: ToolStore) => {
    const servers = s.servers || [];
    const tools: any[] = [];

    servers.forEach((server) => {
      if (!server.tools || server.status !== KlavisServerStatus.CONNECTED) return;

      // Create a manifest for this server that contains all its tools
      const apis = server.tools.map((tool) => ({
        description: tool.description || '',
        name: tool.name,
        parameters: tool.inputSchema || {},
      }));

      if (apis.length > 0) {
        tools.push({
          identifier: `klavis:${server.serverName}`,
          manifest: {
            api: apis,
            author: 'Klavis',
            homepage: 'https://klavis.ai',
            identifier: `klavis:${server.serverName}`,
            meta: {
              avatar: '☁️',
              description: `Klavis MCP Server: ${server.serverName}`,
              tags: ['klavis', 'mcp'],
              title: `Klavis: ${server.serverName}`,
            },
            type: 'klavis',
            version: '1.0.0',
          },
          type: 'plugin',
        });
      }
    });

    return tools;
  },
};
