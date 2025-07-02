import { ConnectionType } from '@lobehub/market-sdk';

interface PluginCompatibility {
  maxAppVersion?: string;
  minAppVersion?: string;
  platforms?: string[];
}

export interface PluginItem {
  authRequirement?: string;
  author?: string;
  capabilities: {
    prompts: boolean;
    resources: boolean;
    tools: boolean;
  };
  category?: string;
  commentCount?: number;
  compatibility?: PluginCompatibility;
  connectionType?: ConnectionType;
  createdAt: string;
  description: string;
  homepage?: string;
  icon?: string;
  identifier: string;
  installCount?: number;
  isInstallable?: boolean;
  isLatest: boolean;
  isValidated?: boolean;
  manifestUrl?: string;
  manifestVersion: string;
  name: string;
  promptsCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  resourcesCount?: number;
  tags?: string[];
  toolsCount?: number;
  version: string;
}

export interface PluginListResponse {
  categories: string[];
  currentPage: number;
  items: PluginItem[];
  pageSize: number;
  tags: string[];
  totalCount: number;
  totalPages: number;
}

export * from './mcp';
export * from './mcpDeps';
