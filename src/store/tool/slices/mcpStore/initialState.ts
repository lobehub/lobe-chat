import { PluginItem } from '@lobehub/market-sdk';

import { MCPInstallProgressMap } from '@/types/plugins';

/* eslint-disable typescript-sort-keys/string-enum */
export enum MCPInstallStep {
  FETCHING_MANIFEST = 'FETCHING_MANIFEST',
  CHECKING_INSTALLATION = 'CHECKING_INSTALLATION',
  DEPENDENCIES_REQUIRED = 'DEPENDENCIES_REQUIRED',
  GETTING_SERVER_MANIFEST = 'GETTING_SERVER_MANIFEST',
  CONFIGURATION_REQUIRED = 'CONFIGURATION_REQUIRED',
  INSTALLING_PLUGIN = 'INSTALLING_PLUGIN',
  COMPLETED = 'COMPLETED',
  ERROR = 'Error',
}
/* eslint-enable */

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
};
