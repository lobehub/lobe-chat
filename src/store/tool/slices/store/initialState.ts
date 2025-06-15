import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

export type PluginInstallLoadingMap = Record<string, boolean | undefined>;

export interface PluginStoreState {
  displayMode: 'grid' | 'list';
  listType: 'old' | 'mcp' | 'installed';
  pluginInstallLoading: PluginInstallLoadingMap;
  pluginStoreList: LobeChatPluginMeta[];
}

export const initialPluginStoreState: PluginStoreState = {
  displayMode: 'grid',
  listType: 'mcp',
  pluginInstallLoading: {},
  pluginStoreList: [],
};
