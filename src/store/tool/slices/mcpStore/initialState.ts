import { PluginItem } from '@lobehub/market-sdk';

export type PluginInstallLoadingMap = Record<string, boolean | undefined>;

export interface MCPStoreState {
  activeMCPIdentifier?: string;
  categories: string[];
  currentPage?: number;
  mcpPluginItems: PluginItem[];
  pageSize?: number;
  tags?: string[];
  totalCount?: number;
  totalPages?: number;
}

export const initialMCPStoreState: MCPStoreState = {
  categories: [],
  mcpPluginItems: [],
};
