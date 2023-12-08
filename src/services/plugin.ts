import {
  LobeChatPluginManifest,
  LobeChatPluginsMarketIndex,
  pluginManifestSchema,
} from '@lobehub/chat-plugin-sdk';

import { getPluginIndexJSON } from '@/const/url';
import { PluginModel } from '@/database/models/plugin';
import { globalHelpers } from '@/store/global/helpers';
import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

export interface InstallPluginParams {
  identifier: string;
  manifest: LobeChatPluginManifest;
  type: 'plugin' | 'customPlugin';
}
class PluginService {
  /**
   * get plugin list from store
   */
  getPluginList = async () => {
    const url = getPluginIndexJSON(globalHelpers.getCurrentLanguage());

    const res = await fetch(url);

    const data: LobeChatPluginsMarketIndex = await res.json();

    return data;
  };

  getPluginManifest = async (url?: string): Promise<LobeChatPluginManifest> => {
    // 1. valid plugin
    if (!url) {
      throw new TypeError('noManifest');
    }

    // 2. 发送请求
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      throw new TypeError('fetchError');
    }

    if (!res.ok) {
      throw new TypeError('fetchError');
    }

    let data;
    try {
      data = await res.json();
    } catch {
      throw new TypeError('urlError');
    }

    // 3. 校验插件文件格式规范
    const parser = pluginManifestSchema.safeParse(data);

    if (!parser.success) {
      throw new TypeError('manifestInvalid', { cause: parser.error });
    }

    return data;
  };

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
    return PluginModel.update(id, value);
  }
  async updatePluginManifest(id: string, manifest: LobeChatPluginManifest) {
    return PluginModel.update(id, { manifest });
  }

  async removeAllPlugins() {
    return PluginModel.clear();
  }

  async updatePluginSettings(id: string, settings: any) {
    return PluginModel.update(id, { settings });
  }
}

export const pluginService = new PluginService();
