import { cloneDeep, isString, merge, uniqBy } from 'lodash-es';
import pMap from 'p-map';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import {
  DEFAULT_DISCOVER_ASSISTANT_ITEM,
  DEFAULT_DISCOVER_MODEL_ITEM,
  DEFAULT_DISCOVER_PLUGIN_ITEM,
  DEFAULT_DISCOVER_PROVIDER_ITEM,
} from '@/const/discover';
import { DEFAULT_LANG } from '@/const/locale';
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
    const list = await this.getAssistantList(locale);
    return list.filter((item) => {
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
    const list = await this.getAssistantList(locale);
    return list.filter((item) => item.meta.category === category);
  };

  getAssistantList = async (locale: Locales): Promise<DiscoverAssistantItem[]> => {
    let res = await fetch(this.assistantStore.getAgentIndexUrl(locale), {
      next: { revalidate },
    });

    if (!res.ok) {
      res = await fetch(this.assistantStore.getAgentIndexUrl(DEFAULT_LANG), {
        next: { revalidate },
      });
    }

    if (!res.ok) return [];

    const json = await res.json();

    return json.agents;
  };

  getAssistantById = async (
    locale: Locales,
    identifier: string,
  ): Promise<DiscoverAssistantItem | undefined> => {
    let res = await fetch(this.assistantStore.getAgentUrl(identifier, locale), {
      next: { revalidate: 12 * revalidate },
    });

    if (!res.ok) {
      res = await fetch(this.assistantStore.getAgentUrl(DEFAULT_LANG), {
        next: { revalidate: 12 * revalidate },
      });
    }

    if (!res.ok) return;

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

  getAssistantByIds = async (
    locale: Locales,
    identifiers: string[],
  ): Promise<DiscoverAssistantItem[]> => {
    const list = await pMap(
      identifiers,
      async (identifier) => this.getAssistantById(locale, identifier),
      {
        concurrency: 5,
      },
    );

    return list.filter(Boolean) as DiscoverAssistantItem[];
  };

  // Tools

  searchPlugin = async (locale: Locales, keywords: string): Promise<DiscoverPlugintem[]> => {
    const list = await this.getPluginList(locale);
    return list.filter((item) => {
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
    const list = await this.getPluginList(locale);
    return list.filter((item) => item.meta.category === category);
  };

  getPluginList = async (locale: Locales): Promise<DiscoverPlugintem[]> => {
    let res = await fetch(this.pluginStore.getPluginIndexUrl(locale), {
      next: { revalidate: 12 * revalidate },
    });

    if (!res.ok) {
      res = await fetch(this.pluginStore.getPluginIndexUrl(DEFAULT_LANG), {
        next: { revalidate: 12 * revalidate },
      });
    }

    if (!res.ok) return [];

    const json = await res.json();

    return json.plugins;
  };

  getPluginByIds = async (locale: Locales, identifiers: string[]): Promise<DiscoverPlugintem[]> => {
    let list = await pMap(
      identifiers,
      async (identifier) => this.getPluginById(locale, identifier),
      {
        concurrency: 5,
      },
    );

    return list.filter(Boolean) as DiscoverPlugintem[];
  };

  getPluginById = async (
    locale: Locales,
    identifier: string,
    withManifest?: boolean,
  ): Promise<DiscoverPlugintem | undefined> => {
    const list = await this.getPluginList(locale);
    let plugin = list.find((item) => item.identifier === identifier) as DiscoverPlugintem;

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
    const list = DEFAULT_MODEL_PROVIDER_LIST.filter((item) => item.chatModels.length > 0);
    return list.map((item) => {
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
    const list = await this.getProviderList(locale);
    return list.filter((item) => {
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
    const list = await this.getProviderList(locale);
    let provider = list.find((item) => item.identifier === id);

    if (!provider) return;

    provider = {
      ...provider,
      suggestions: list
        .filter((item) => item.identifier !== provider?.identifier)
        .slice(0, 5) as any,
    };

    return merge(cloneDeep(DEFAULT_DISCOVER_PROVIDER_ITEM), provider) as DiscoverProviderItem;
  };

  getProviderByIds = async (
    locale: Locales,
    identifiers: string[],
  ): Promise<DiscoverProviderItem[]> => {
    const list = await pMap(
      identifiers,
      async (identifier) => this.getProviderById(locale, identifier),
      {
        concurrency: 5,
      },
    );

    return list.filter(Boolean) as DiscoverProviderItem[];
  };

  // Models

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _getModelList = async (locale: Locales): Promise<DiscoverModelItem[]> => {
    const list = DEFAULT_MODEL_PROVIDER_LIST.filter((item) => item.chatModels.length > 0);
    const providers = await this.getProviderList(locale);

    return list.flatMap((provider) => {
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
    const list = await this._getModelList(locale);

    return uniqBy(list, (item) => {
      const ids = item.identifier.split('/');
      return ids[1] || item.identifier;
    });
  };

  searchModel = async (locale: Locales, keywords: string): Promise<DiscoverModelItem[]> => {
    const list = await this.getModelList(locale);
    return list.filter((item) => {
      return [item.identifier, item.meta.title, item.meta.description, item.providers]
        .flat()
        .filter(Boolean)
        .join(',')
        .toLowerCase()
        .includes(decodeURIComponent(keywords).toLowerCase());
    });
  };

  getModelCategory = async (locale: Locales, category: string): Promise<DiscoverModelItem[]> => {
    const list = await this._getModelList(locale);
    return list.filter((item) => item.meta.category === category);
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
    const list = await pMap(
      identifiers,
      async (identifier) => this.getModelById(locale, identifier),
      {
        concurrency: 5,
      },
    );
    return list.filter(Boolean) as DiscoverModelItem[];
  };
}
