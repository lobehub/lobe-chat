import { LobeToolMeta } from '@lobechat/types';

import { shouldEnableTool } from '@/helpers/toolFilters';

import type { ToolStoreState } from '../../initialState';
import { KlavisServerStatus } from '../klavisStore';

const metaList = (s: ToolStoreState): LobeToolMeta[] => {
  // Get builtin tools meta list
  const builtinMetas = s.builtinTools
    .filter((item) => {
      // Filter hidden tools
      if (item.hidden) return false;

      // Filter platform-specific tools (e.g., LocalSystem desktop-only)
      if (!shouldEnableTool(item.identifier)) return false;

      return true;
    })
    .map((t) => ({
      author: 'LobeHub',
      identifier: t.identifier,
      meta: t.manifest.meta,
      type: 'builtin' as const,
    }));

  // Get Klavis servers as builtin tools meta
  const klavisMetas = (s.servers || [])
    .filter((server) => server.status === KlavisServerStatus.CONNECTED && server.tools?.length)
    .map((server) => ({
      author: 'Klavis',
      // 使用 identifier 作为存储标识符（如 'google-calendar'）
      identifier: server.identifier,
      meta: {
        avatar: '☁️',
        description: `Klavis MCP Server: ${server.serverName}`,
        tags: ['klavis', 'mcp'],
        // title 仍然使用 serverName 显示友好名称
        title: server.serverName,
      },
      type: 'builtin' as const,
    }));

  return [...builtinMetas, ...klavisMetas];
};

export const builtinToolSelectors = {
  metaList,
};
