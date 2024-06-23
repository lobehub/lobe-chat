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

  async uninstallPlugin(identifier: string) {
    await lambdaClient.plugin.removePlugin.mutate({ id: identifier });
  }

  async createCustomPlugin(customPlugin: LobeToolCustomPlugin) {
    await lambdaClient.plugin.createPlugin.mutate({ ...customPlugin, type: 'customPlugin' });
  }

  async updatePlugin(id: string, value: LobeToolCustomPlugin) {
    await lambdaClient.plugin.updatePlugin.mutate({
      customParams: value.customParams,
      id,
      manifest: value.manifest,
      settings: value.settings,
    });
  }

  async updatePluginManifest(id: string, manifest: LobeChatPluginManifest) {
    await lambdaClient.plugin.updatePlugin.mutate({ id, manifest });
  }

  async removeAllPlugins() {
    await lambdaClient.plugin.removeAllPlugins.mutate();
  }

  async updatePluginSettings(id: string, settings: any, signal?: AbortSignal) {
    await lambdaClient.plugin.updatePlugin.mutate({ id, settings }, { signal });
  }
}
