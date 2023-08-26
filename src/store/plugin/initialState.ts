import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { PluginManifestMap } from '@/types/plugin';

export type PluginManifestLoadingState = Record<string, boolean>;
export type PluginsSettings = Record<string, any>;

export interface PluginStoreState {
  manifestPrepared: boolean;
  pluginList: LobeChatPluginMeta[];
  pluginManifestLoading: PluginManifestLoadingState;
  pluginManifestMap: PluginManifestMap;
  pluginsSettings: PluginsSettings;
}

export const initialState: PluginStoreState = {
  manifestPrepared: false,
  pluginList: [],
  pluginManifestLoading: {},
  pluginManifestMap: {},
  pluginsSettings: {},
};
