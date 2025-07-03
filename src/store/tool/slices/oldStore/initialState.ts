import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { isDesktop } from '@/const/version';
import { DiscoverPluginItem } from '@/types/discover';

export type PluginInstallLoadingMap = Record<string, boolean | undefined>;

export enum PluginStoreTabs {
  Installed = 'installed',
  MCP = 'mcp',
  Plugin = 'old',
}

export interface PluginStoreState {
  // Plugin list state management (similar to MCP)
  activePluginIdentifier?: string;
  currentPluginPage: number;
  displayMode: 'grid' | 'list';
  isPluginListInit?: boolean;

  listType: PluginStoreTabs;
  pluginInstallLoading: PluginInstallLoadingMap;
  pluginItems: DiscoverPluginItem[];
  pluginSearchKeywords?: string;
  pluginSearchLoading?: boolean;
  pluginStoreList: LobeChatPluginMeta[];
  pluginTotalCount?: number;
}

export const initialPluginStoreState: PluginStoreState = {
  // Plugin list state management initial values
  currentPluginPage: 1,
  displayMode: 'grid',
  listType: isDesktop ? PluginStoreTabs.MCP : PluginStoreTabs.Plugin,
  pluginInstallLoading: {},
  pluginItems: [],
  pluginStoreList: [],
};
