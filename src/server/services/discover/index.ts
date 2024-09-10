import { cloneDeep, isString, merge, uniqBy } from 'lodash-es';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import {
  DEFAULT_DISCOVER_ASSISTANT_ITEM,
  DEFAULT_DISCOVER_MODEL_ITEM,
  DEFAULT_DISCOVER_PLUGIN_ITEM,
  DEFAULT_DISCOVER_PROVIDER_ITEM,
} from '@/const/discover';
import { Locales } from '@/locales/resources';
import { AssistantStore } from '@/server/modules/AssistantStore';
import { PluginStore } from '@/server/modules/PluginStore';
import {
  AssistantCategory,
  DiscoverAssistantItem,
  DiscoverModelItem,
  DiscoverPlugintem,
  DiscoverProviderItem,
  PluginCategory,
} from '@/types/discover';
import { getToolManifest } from '@/utils/toolManifest';

const revalidate: number = 3600;

export class DiscoverService {
  assistantStore = new AssistantStore();
  pluginStore = new PluginStore();

  // Assistants
  searchAssistant = async (locale: Locales, keywords: string): Promise<DiscoverAssistantItem[]> => {
    const assistantList = await this.getAssistantList(locale);
    return assistantList.filter((item) => {
      return [item.author, item.meta.title, item.meta.description, item.meta?.tags]
        .flat()
        .filter(Boolean)
        .join(',')
        .toLowerCase()
        .includes(decodeURIComponent(keywords).toLowerCase());
    });
  };

  getAssistantCategory = async (
    locale: Locales,
    category: AssistantCategory,
  ): Promise<DiscoverAssistantItem[]> => {
    const assistantList = await this.getAssistantList(locale);
    return assistantList.filter((item) => item.meta.category === category);
  };

  getAssistantList = async (locale: Locales): Promise<DiscoverAssistantItem[]> => {
    const res = await fetch(this.assistantStore.getAgentIndexUrl(locale), {
      next: { revalidate },
    });

    const json = await res.json();

    return json.agents;
  };

  getAssistantById = async (
    locale: Locales,
    identifier: string,
  ): Promise<DiscoverAssistantItem | undefined> => {
    const res = await fetch(this.assistantStore.getAgentUrl(identifier, locale), {
      next: { revalidate: 12 * revalidate },
    });

    let assistant = await res.json();

    if (!assistant) return;

    assistant = merge(cloneDeep(DEFAULT_DISCOVER_ASSISTANT_ITEM), assistant);

    const categoryItems = await this.getAssistantCategory(
      locale,
      assistant.meta.category || AssistantCategory.General,
    );

    assistant = {
      ...assistant,
      suggestions: categoryItems
        .filter((item) => item.identifier !== assistant.identifier)
        .slice(0, 5) as any,
    };

    return assistant;
  };

  // Tools

  searchTool = async (locale: Locales, keywords: string): Promise<DiscoverPlugintem[]> => {
    const toolList = await this.getPluginList(locale);
    return toolList.filter((item) => {
      return [item.author, item.meta.title, item.meta.description, item.meta?.tags]
        .flat()
        .filter(Boolean)
        .join(',')
        .toLowerCase()
        .includes(decodeURIComponent(keywords).toLowerCase());
    });
  };

  getPluginCategory = async (
    locale: Locales,
    category: PluginCategory,
  ): Promise<DiscoverPlugintem[]> => {
    const toolList = await this.getPluginList(locale);
    return toolList.filter((item) => item.meta.category === category);
  };

  getPluginList = async (locale: Locales): Promise<DiscoverPlugintem[]> => {
    const res = await fetch(this.pluginStore.getPluginIndexUrl(locale), {
      next: { revalidate: 12 * revalidate },
    });
    const json = await res.json();
    return json.plugins;
  };

  getPluginByIds = async (locale: Locales, identifiers: string[]): Promise<DiscoverPlugintem[]> => {
    const toolList = await this.getPluginList(locale);
    return toolList.filter((item) => identifiers.includes(item.identifier));
  };

  getPluginById = async (
    locale: Locales,
    identifier: string,
    withManifest?: boolean,
  ): Promise<DiscoverPlugintem | undefined> => {
    const pluginList = await this.getPluginList(locale);
    let plugin = pluginList.find((item) => item.identifier === identifier) as DiscoverPlugintem;

    if (!plugin) return;

    plugin = merge(cloneDeep(DEFAULT_DISCOVER_PLUGIN_ITEM), plugin);

    if (withManifest) {
      const manifest = isString(plugin?.manifest)
        ? await getToolManifest(plugin.manifest)
        : plugin?.manifest;

      plugin = {
        ...plugin,
        manifest,
      } as DiscoverPlugintem;
    }

    const categoryItems = await this.getPluginCategory(
      locale,
      plugin.meta.category || PluginCategory.Tools,
    );

    plugin = {
      ...plugin,
      suggestions: categoryItems
        .filter((item) => item.identifier !== plugin.identifier)
        .slice(0, 5) as any,
    } as DiscoverPlugintem;

    return plugin;
  };

  // Providers

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getProviderList = async (locale: Locales): Promise<DiscoverProviderItem[]> => {
    const providerList = DEFAULT_MODEL_PROVIDER_LIST.filter((item) => item.chatModels.length > 0);
    return providerList.map((item) => {
      const provider = {
        identifier: item.id,
        meta: {
          ...item,
          title: item.name,
        },
        models: item.chatModels.map((item) => item.id),
      };
      return merge(cloneDeep(DEFAULT_DISCOVER_PROVIDER_ITEM), provider) as DiscoverProviderItem;
    });
  };

  searchProvider = async (locale: Locales, keywords: string): Promise<DiscoverProviderItem[]> => {
    const providerList = await this.getProviderList(locale);
    return providerList.filter((item) => {
      return [item.identifier, item.meta.title]
        .filter(Boolean)
        .join(',')
        .toLowerCase()
        .includes(decodeURIComponent(keywords).toLowerCase());
    });
  };

  getProviderById = async (
    locale: Locales,
    id: string,
  ): Promise<DiscoverProviderItem | undefined> => {
    const providerList = await this.getProviderList(locale);
    let provider = providerList.find((item) => item.identifier === id);

    if (!provider) return;

    provider = {
      ...provider,
      suggestions: providerList
        .filter((item) => item.identifier !== provider?.identifier)
        .slice(0, 5) as any,
    };

    return merge(cloneDeep(DEFAULT_DISCOVER_PROVIDER_ITEM), provider) as DiscoverProviderItem;
  };

  // Models

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _getModelList = async (locale: Locales): Promise<DiscoverModelItem[]> => {
    const providerList = DEFAULT_MODEL_PROVIDER_LIST.filter((item) => item.chatModels.length > 0);
    const providers = await this.getProviderList(locale);

    return providerList.flatMap((provider) => {
      return provider.chatModels.map((item) => {
        const ids = item.id.split('/')[1] || item.id;
        const providerIds = providers
          .filter((provider) => provider.models.join('').includes(ids))
          .map((provider) => provider.identifier);
        const model = {
          identifier: item.id,
          meta: {
            ...item,
            category: provider.id,
            title: item.displayName || item.id,
          },
          providers: providerIds,
          suggestions: [],
        };
        return merge(cloneDeep(DEFAULT_DISCOVER_MODEL_ITEM), model) as DiscoverModelItem;
      });
    });
  };

  getModelList = async (locale: Locales): Promise<DiscoverModelItem[]> => {
    const modelList = await this._getModelList(locale);

    return uniqBy(modelList, (item) => {
      const ids = item.identifier.split('/');
      return ids[1] || item.identifier;
    });
  };

  searchModel = async (locale: Locales, keywords: string): Promise<DiscoverModelItem[]> => {
    const modelList = await this.getModelList(locale);
    return modelList.filter((item) => {
      return [item.identifier, item.meta.title, item.meta.description, item.providers]
        .flat()
        .filter(Boolean)
        .join(',')
        .toLowerCase()
        .includes(decodeURIComponent(keywords).toLowerCase());
    });
  };

  getModelCategory = async (locale: Locales, category: string): Promise<DiscoverModelItem[]> => {
    const modelList = await this._getModelList(locale);
    return modelList.filter((item) => item.meta.category === category);
  };

  getModelById = async (locale: Locales, id: string): Promise<DiscoverModelItem | undefined> => {
    const list = await this.getModelList(locale);
    let model = list.find((item) => item.identifier === id);

    if (!model) return;

    const categoryItems = model?.meta?.category
      ? await this.getModelCategory(locale, model.meta.category)
      : [];

    model = {
      ...model,
      suggestions: categoryItems
        .filter((item) => item.identifier !== model?.identifier)
        .slice(0, 5) as any,
    };

    return merge(cloneDeep(DEFAULT_DISCOVER_MODEL_ITEM), model);
  };

  getModelByIds = async (locale: Locales, identifiers: string[]): Promise<DiscoverModelItem[]> => {
    const modelList = await this.getModelList(locale);
    return modelList.filter((item) => identifiers.includes(item.identifier));
  };
}
