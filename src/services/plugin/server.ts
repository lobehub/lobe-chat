import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { lambdaClient } from '@/libs/trpc/client';
import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { IPluginService, InstallPluginParams } from './type';

export class ServerService implements IPluginService {
  installPlugin = async (plugin: InstallPluginParams) => {
    await lambdaClient.plugin.createOrInstallPlugin.mutate(plugin);
  };

  getInstalledPlugins = (): Promise<LobeTool[]> => {
    return lambdaClient.plugin.getPlugins.query();
  };

  uninstallPlugin = async (identifier: string) => {
    await lambdaClient.plugin.removePlugin.mutate({ id: identifier });
  };

  createCustomPlugin = async (customPlugin: LobeToolCustomPlugin) => {
    await lambdaClient.plugin.createPlugin.mutate({ ...customPlugin, type: 'customPlugin' });
  };

  updatePlugin = async (id: string, value: LobeToolCustomPlugin) => {
    await lambdaClient.plugin.updatePlugin.mutate({
      customParams: value.customParams,
      id,
      manifest: value.manifest,
      settings: value.settings,
    });
  };

  updatePluginManifest = async (id: string, manifest: LobeChatPluginManifest) => {
    await lambdaClient.plugin.updatePlugin.mutate({ id, manifest });
  };

  removeAllPlugins = async () => {
    await lambdaClient.plugin.removeAllPlugins.mutate();
  };

  updatePluginSettings = async (id: string, settings: any, signal?: AbortSignal) => {
    await lambdaClient.plugin.updatePlugin.mutate({ id, settings }, { signal });
  };
}
