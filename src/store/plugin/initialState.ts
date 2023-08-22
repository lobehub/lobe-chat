import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { PluginManifestMap } from '@/types/plugin';

export type PluginManifestLoadingState = Record<string, boolean>;

export interface PluginStoreState {
  manifestPrepared: boolean;
  pluginList: LobeChatPluginMeta[];
  pluginManifestLoading: PluginManifestLoadingState;
  pluginManifestMap: PluginManifestMap;
}

export const initialState: PluginStoreState = {
  manifestPrepared: false,
  pluginList: [],
  pluginManifestLoading: {},
  pluginManifestMap: {},
};
