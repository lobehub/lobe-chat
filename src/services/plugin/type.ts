import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

export interface InstallPluginParams {
  customParams?: Record<string, any>;
  identifier: string;
  manifest: LobeChatPluginManifest;
  settings?: Record<string, any>;
  type: 'plugin' | 'customPlugin';
}

export interface IPluginService {
  createCustomPlugin: (customPlugin: LobeToolCustomPlugin) => Promise<void>;
  getInstalledPlugins: () => Promise<LobeTool[]>;
  installPlugin: (plugin: InstallPluginParams) => Promise<void>;
  removeAllPlugins: () => Promise<void>;
  uninstallPlugin: (identifier: string) => Promise<void>;
  updatePlugin: (id: string, value: Partial<LobeToolCustomPlugin>) => Promise<void>;
  updatePluginManifest: (id: string, manifest: LobeChatPluginManifest) => Promise<void>;
  updatePluginSettings: (id: string, settings: any, signal?: AbortSignal) => Promise<void>;
}
