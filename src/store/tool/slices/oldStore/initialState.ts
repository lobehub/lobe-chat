import { isDesktop } from '@/const/version';
import { DiscoverPluginItem } from '@/types/discover';

export type PluginInstallLoadingMap = Record<string, boolean | undefined>;

export enum PluginStoreTabs {
  Installed = 'installed',
  MCP = 'mcp',
  Plugin = 'old',
}

export interface PluginStoreState {
  activePluginIdentifier?: string;
  currentPluginPage: number;
  displayMode: 'grid' | 'list';
  isPluginListInit?: boolean;

  listType: PluginStoreTabs;
  oldPluginItems: DiscoverPluginItem[];
  pluginInstallLoading: PluginInstallLoadingMap;
  pluginSearchKeywords?: string;
  pluginSearchLoading?: boolean;
  pluginTotalCount?: number;
}

export const initialPluginStoreState: PluginStoreState = {
  // Plugin list state management initial values
  currentPluginPage: 1,
  displayMode: 'grid',
  listType: isDesktop ? PluginStoreTabs.MCP : PluginStoreTabs.Plugin,
  oldPluginItems: [],
  pluginInstallLoading: {},
};
