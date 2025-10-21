import { LobeTool } from '@lobechat/types';

import { clientDB } from '@/database/client/db';
import { PluginModel } from '@/database/models/plugin';
import { BaseClientService } from '@/services/baseClientService';

import { IPluginService } from './type';

export class ClientService extends BaseClientService implements IPluginService {
  private get pluginModel(): PluginModel {
    return new PluginModel(clientDB as any, this.userId);
  }

  installPlugin: IPluginService['installPlugin'] = async (plugin) => {
    await this.pluginModel.create(plugin);
  };

  getInstalledPlugins: IPluginService['getInstalledPlugins'] = () => {
    return this.pluginModel.query() as Promise<LobeTool[]>;
  };

  uninstallPlugin: IPluginService['uninstallPlugin'] = async (identifier) => {
    await this.pluginModel.delete(identifier);
  };

  createCustomPlugin: IPluginService['createCustomPlugin'] = async (customPlugin) => {
    await this.pluginModel.create({ ...customPlugin, type: 'customPlugin' });
  };

  updatePlugin: IPluginService['updatePlugin'] = async (id, value) => {
    await this.pluginModel.update(id, value);
  };

  updatePluginManifest: IPluginService['updatePluginManifest'] = async (id, manifest) => {
    await this.pluginModel.update(id, { manifest });
  };

  removeAllPlugins: IPluginService['removeAllPlugins'] = async () => {
    await this.pluginModel.deleteAll();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatePluginSettings: IPluginService['updatePluginSettings'] = async (id, settings, _?) => {
    await this.pluginModel.update(id, { settings });
  };
}
