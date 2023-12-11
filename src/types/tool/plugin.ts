import { LobeChatPluginManifest, Meta } from '@lobehub/chat-plugin-sdk';

import { LobeToolType } from './tool';

export type PluginManifestMap = Record<string, LobeChatPluginManifest>;

export interface CustomPluginParams {
  apiMode?: 'openapi' | 'simple';
  enableSettings?: boolean;
  manifestMode?: 'local' | 'url';
  manifestUrl?: string;
}

export interface LobeToolCustomPlugin {
  customParams?: CustomPluginParams;
  identifier: string;
  manifest?: LobeChatPluginManifest;
  settings?: any;
  type: 'customPlugin';
}

export interface InstallPluginMeta {
  author?: string;
  createdAt?: string;
  homepage?: string;
  identifier: string;
  meta?: Meta;
  type: LobeToolType;
}

export interface PluginInstallError {
  cause?: string;
  message: 'noManifest' | 'fetchError' | 'manifestInvalid' | 'urlError';
}
