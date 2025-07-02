import { PluginItem } from '@lobehub/market-sdk';

import { MCPInstallProgressMap } from '@/types/plugins';

export enum MCPInstallStep {
  FETCHING_MANIFEST,
  CHECKING_INSTALLATION,
  GETTING_SERVER_MANIFEST,
  CONFIGURATION_REQUIRED,
  INSTALLING_PLUGIN,
  COMPLETED,
  ERROR = 'Error',
}

export interface MCPStoreState {
  activeMCPIdentifier?: string;
  categories: string[];
  currentPage: number;
  isLoadingMore?: boolean;
  isMcpListInit?: boolean;
  mcpInstallProgress: MCPInstallProgressMap;
  mcpPluginItems: PluginItem[];
  mcpSearchKeywords?: string;
  searchLoading?: boolean;
  tags?: string[];
  totalCount?: number;
  totalPages?: number;
}

export const initialMCPStoreState: MCPStoreState = {
  categories: [],
  currentPage: 1,
  mcpInstallProgress: {},
  mcpPluginItems: [],
};
