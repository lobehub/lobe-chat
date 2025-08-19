import { PluginItem } from '@lobehub/market-sdk';

import { MCPInstallProgressMap } from '@/types/plugins';

export interface MCPStoreState {
  activeMCPIdentifier?: string;
  categories: string[];
  currentPage: number;
  isLoadingMore?: boolean;
  isMcpListInit?: boolean;
  mcpInstallAbortControllers: Record<string, AbortController>;
  mcpInstallProgress: MCPInstallProgressMap;
  mcpPluginItems: PluginItem[];
  mcpSearchKeywords?: string;
  // 测试连接相关状态
  mcpTestAbortControllers: Record<string, AbortController>;
  mcpTestErrors: Record<string, string>;
  mcpTestLoading: Record<string, boolean>;
  searchLoading?: boolean;
  tags?: string[];
  totalCount?: number;
  totalPages?: number;
}

export const initialMCPStoreState: MCPStoreState = {
  categories: [],
  currentPage: 1,
  mcpInstallAbortControllers: {},
  mcpInstallProgress: {},
  mcpPluginItems: [],
  // 测试连接相关状态初始化
  mcpTestAbortControllers: {},
  mcpTestErrors: {},
  mcpTestLoading: {},
};
