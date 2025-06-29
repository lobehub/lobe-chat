import { PluginItem } from '@lobehub/market-sdk';

export enum MCPInstallStep {
  FETCHING_MANIFEST,
  CHECKING_INSTALLATION,
  GETTING_SERVER_MANIFEST,
  INSTALLING_PLUGIN,
  COMPLETED,
}

export interface MCPInstallProgress {
  progress: number;
  step: MCPInstallStep; // 0-100
}

export type MCPInstallProgressMap = Record<string, MCPInstallProgress | undefined>;

export interface MCPStoreState {
  activeMCPIdentifier?: string;
  categories: string[];
  currentPage?: number;
  mcpInstallProgress: MCPInstallProgressMap;
  mcpPluginItems: PluginItem[];
  pageSize?: number;
  tags?: string[];
  totalCount?: number;
  totalPages?: number;
}

export const initialMCPStoreState: MCPStoreState = {
  categories: [],
  mcpInstallProgress: {},
  mcpPluginItems: [],
};
