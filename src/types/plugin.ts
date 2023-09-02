import { LobeChatPluginManifest, LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

export type PluginManifestMap = Record<string, LobeChatPluginManifest>;

export interface CustomPlugin extends LobeChatPluginMeta {
  apiMode: 'openapi' | 'simple';
  enableSettings: boolean;
  manifestConfig?: LobeChatPluginManifest;
  manifestMode: 'local' | 'url';
}
