import {
  LobeChatPluginManifest,
  LobeChatPluginsMarketIndex,
  pluginManifestSchema,
} from '@lobehub/chat-plugin-sdk';

import { PluginModel } from '@/database/models/plugin';
import { globalHelpers } from '@/store/global/helpers';
import { OpenAIPluginManifest } from '@/types/openai/plugin';
import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { API_ENDPOINTS } from './_url';

export interface InstallPluginParams {
  identifier: string;
  manifest: LobeChatPluginManifest;
  type: 'plugin' | 'customPlugin';
}
class PluginService {
  private _fetchJSON = async <T = any>(url: string, proxy = false): Promise<T> => {
    // 2. 发送请求
    let res: Response;
    try {
      res = await (proxy ? fetch(API_ENDPOINTS.proxy, { body: url, method: 'POST' }) : fetch(url));
    } catch {
      throw new TypeError('fetchError');
    }

    if (!res.ok) {
      throw new TypeError('fetchError');
    }

    let data;
    const contentType = res.headers.get('Content-Type');

    try {
      if (contentType === 'application/json') {
        data = await res.json();
      } else {
        const { default: YAML } = await import('yaml');

        const yaml = await res.text();
        data = YAML.parse(yaml);
      }
    } catch {
      throw new TypeError('urlError');
    }

    return data;
  };
  /**
   * get plugin list from store
   */
  getPluginList = async (): Promise<LobeChatPluginsMarketIndex> => {
    const locale = globalHelpers.getCurrentLanguage();

    const res = await fetch(`${API_ENDPOINTS.pluginStore}?locale=${locale}`);

    return res.json();
  };

  getPluginManifest = async (
    url?: string,
    useProxy: boolean = false,
  ): Promise<LobeChatPluginManifest> => {
    // 1. valid plugin
    if (!url) {
      throw new TypeError('noManifest');
    }

    // 2. 发送请求

    let data = await this._fetchJSON<LobeChatPluginManifest>(url, useProxy);

    // @ts-ignore
    // if there is a description_for_model, it is an OpenAI plugin
    // we need convert to lobe plugin
    if (data['description_for_model']) {
      data = this.convertOpenAIManifestToLobeManifest(data as any);
    }

    // 3. 校验插件文件格式规范
    const parser = pluginManifestSchema.safeParse(data);

    if (!parser.success) {
      throw new TypeError('manifestInvalid', { cause: parser.error });
    }

    // 4. if exist OpenAPI api, merge the OpenAPIs to api
    if (parser.data.openapi) {
      const openapiJson = await this._fetchJSON(parser.data.openapi, useProxy);

      try {
        const { OpenAPIConvertor } = await import('@lobehub/chat-plugin-sdk/openapi');

        const convertor = new OpenAPIConvertor(openapiJson);
        const openAPIs = await convertor.convertOpenAPIToPluginSchema();
        data.api = [...data.api, ...openAPIs];

        data.settings = await convertor.convertAuthToSettingsSchema(data.settings);
      } catch (error) {
        throw new TypeError('openAPIInvalid', { cause: error });
      }
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

  private convertOpenAIManifestToLobeManifest = (
    data: OpenAIPluginManifest,
  ): LobeChatPluginManifest => {
    const manifest: LobeChatPluginManifest = {
      api: [],
      homepage: data.legal_info_url,
      identifier: data.name_for_model,
      meta: {
        avatar: data.logo_url,
        description: data.description_for_human,
        title: data.name_for_human,
      },
      openapi: data.api.url,
      systemRole: data.description_for_model,
      type: 'default',
      version: '1',
    };
    switch (data.auth.type) {
      case 'none': {
        break;
      }
      case 'service_http': {
        manifest.settings = {
          properties: {
            apiAuthKey: {
              default: data.auth.verification_tokens['openai'],
              description: 'API Key',
              format: 'password',
              title: 'API Key',
              type: 'string',
            },
          },
          type: 'object',
        };
        break;
      }
    }

    return manifest;
  };
}

export const pluginService = new PluginService();
