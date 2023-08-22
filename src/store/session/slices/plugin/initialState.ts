import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { PluginManifestMap } from '@/types/plugin';

export type PluginManifestLoadingState = Record<string, boolean>;

export interface PluginState {
  manifestPrepared: boolean;
  pluginList: LobeChatPluginMeta[];
  pluginManifestLoading: PluginManifestLoadingState;
  pluginManifestMap: PluginManifestMap;
}

export const initialPluginState: PluginState = {
  manifestPrepared: false,
  pluginList: [],
  pluginManifestLoading: {},
  pluginManifestMap: {},
};
