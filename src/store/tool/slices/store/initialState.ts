import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

export type PluginInstallLoadingMap = Record<string, boolean | undefined>;

export enum PluginStoreTabs {
  Installed = 'installed',
  MCP = 'mcp',
  Plugin = 'old',
}

export interface PluginStoreState {
  displayMode: 'grid' | 'list';
  listType: PluginStoreTabs;
  pluginInstallLoading: PluginInstallLoadingMap;
  pluginStoreList: LobeChatPluginMeta[];
}

export const initialPluginStoreState: PluginStoreState = {
  displayMode: 'grid',
  listType: PluginStoreTabs.MCP,
  pluginInstallLoading: {},
  pluginStoreList: [],
};
