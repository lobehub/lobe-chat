import { LobeChatPluginManifest, LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { PluginManifestMap } from '@/types/plugin';

export type PluginManifestLoadingState = Record<string, boolean>;
export type PluginsSettings = Record<string, any>;

export interface DevPlugin extends LobeChatPluginMeta {
  apiMode: 'openapi' | 'simple';
  enableSettings: boolean;
  manifestConfig?: LobeChatPluginManifest;
  manifestMode: 'local' | 'url';
}

export interface PluginStoreState {
  devPluginList: DevPlugin[];
  manifestPrepared: boolean;
  newDevPlugin: Partial<DevPlugin>;
  pluginList: LobeChatPluginMeta[];
  pluginManifestLoading: PluginManifestLoadingState;
  pluginManifestMap: PluginManifestMap;
  pluginsSettings: PluginsSettings;
}
export const defaultDevPlugin: Partial<DevPlugin> = {
  apiMode: 'simple',
  enableSettings: false,
  manifestMode: 'url',
};

export const initialState: PluginStoreState = {
  devPluginList: [],
  manifestPrepared: false,
  newDevPlugin: defaultDevPlugin,
  pluginList: [],
  pluginManifestLoading: {},
  pluginManifestMap: {},
  pluginsSettings: {},
};
