import { LobeChatPluginManifest, Meta } from '@lobehub/chat-plugin-sdk';

import { LobeToolType } from './tool';

export type PluginManifestMap = Record<string, LobeChatPluginManifest>;

export interface CustomPluginMetadata {
  avatar?: string;
  description?: string;
  name?: string;
}

export interface CustomPluginParams {
  apiMode?: 'openapi' | 'simple';
  enableSettings?: boolean;
  manifestMode?: 'local' | 'url';
  manifestUrl?: string;
  useProxy?: boolean;

  /* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */
  /**
   * TODO: 临时方案，后续需要做一次大重构
   */
  mcp?: {
    args?: string[];
    env?: Record<string, string>;
    command?: string;
    type: 'http' | 'stdio';
    url?: string;
    // 新增认证配置支持
    auth?: {
      type: 'none' | 'bearer' | 'oauth2';
      token?: string; // Bearer Token
      accessToken?: string; // OAuth2 Access Token
    };
    // 新增 headers 配置支持
    headers?: Record<string, string>;
  };
  avatar?: string;
  description?: string;
  /* eslint-enable */
}

export interface LobeToolCustomPlugin {
  customParams?: CustomPluginParams;
  identifier: string;
  manifest?: LobeChatPluginManifest;
  settings?: any;
  type: 'customPlugin';
}

export interface InstallPluginMeta extends Partial<Meta> {
  author?: string;
  createdAt?: string;
  homepage?: string;
  identifier: string;
  runtimeType?: 'mcp' | 'default' | 'markdown' | 'standalone' | undefined;
  type: LobeToolType;
}

export interface PluginInstallError {
  cause?: string;
  message: 'noManifest' | 'fetchError' | 'manifestInvalid' | 'urlError';
}
