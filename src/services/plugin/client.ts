import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { clientDB } from '@/database/client/db';
import { PluginModel } from '@/database/server/models/plugin';
import { BaseClientService } from '@/services/baseClientService';
import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { IPluginService, InstallPluginParams } from './type';

export class ClientService extends BaseClientService implements IPluginService {
  private get pluginModel(): PluginModel {
    return new PluginModel(clientDB as any, this.userId);
  }

  installPlugin = async (plugin: InstallPluginParams) => {
    await this.pluginModel.create(plugin);
    return;
  };

  getInstalledPlugins = () => {
    return this.pluginModel.query() as Promise<LobeTool[]>;
  };

  async uninstallPlugin(identifier: string) {
    await this.pluginModel.delete(identifier);
    return;
  }

  async createCustomPlugin(customPlugin: LobeToolCustomPlugin) {
    await this.pluginModel.create({ ...customPlugin, type: 'customPlugin' });
    return;
  }

  async updatePlugin(id: string, value: LobeToolCustomPlugin) {
    await this.pluginModel.update(id, value);
    return;
  }
  async updatePluginManifest(id: string, manifest: LobeChatPluginManifest) {
    await this.pluginModel.update(id, { manifest });
  }

  async removeAllPlugins() {
    await this.pluginModel.deleteAll();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updatePluginSettings(id: string, settings: any, _?: AbortSignal) {
    await this.pluginModel.update(id, { settings });
  }
}
