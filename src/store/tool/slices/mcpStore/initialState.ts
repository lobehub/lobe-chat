import { PluginItem } from '@lobehub/market-sdk';

export enum MCPInstallStep {
  FETCHING_MANIFEST,
  CHECKING_INSTALLATION,
  GETTING_SERVER_MANIFEST,
  CONFIGURATION_REQUIRED,
  INSTALLING_PLUGIN,
  COMPLETED,
}

export interface MCPInstallProgress {
  configSchema?: any;
  // connection info from checkInstallation
  connection?: any;
  manifest?: any;
  // LobeChatPluginManifest
  needsConfig?: boolean;
  // 0-100
  progress: number;
  step: MCPInstallStep; // 配置模式，提到顶层方便访问
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
