import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { PluginModel } from '@/database/_deprecated/models/plugin';
import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { IPluginService, InstallPluginParams } from './type';

export class ClientService implements IPluginService {
  installPlugin = async (plugin: InstallPluginParams) => {
    return PluginModel.create(plugin);
  };

  getInstalledPlugins = () => {
    return PluginModel.getList() as Promise<LobeTool[]>;
  };

  uninstallPlugin(identifier: string) {
    return PluginModel.delete(identifier);
  }

  async createCustomPlugin(customPlugin: LobeToolCustomPlugin) {
    return PluginModel.create({ ...customPlugin, type: 'customPlugin' });
  }

  async updatePlugin(id: string, value: LobeToolCustomPlugin) {
    await PluginModel.update(id, value);
    return;
  }
  async updatePluginManifest(id: string, manifest: LobeChatPluginManifest) {
    await PluginModel.update(id, { manifest });
  }

  async removeAllPlugins() {
    return PluginModel.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updatePluginSettings(id: string, settings: any, _?: AbortSignal) {
    await PluginModel.update(id, { settings });
  }
}
