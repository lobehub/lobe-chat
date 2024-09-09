import { cloneDeep, isString, merge, uniqBy } from 'lodash-es';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import {
  DEFAULT_DISCOVER_AGENT_ITEM,
  DEFAULT_DISCOVER_MODEL_ITEM,
  DEFAULT_DISCOVER_PROVIDER_ITEM,
} from '@/const/discover';
import { assistantService } from '@/services/assistant';
import { toolService } from '@/services/tool';
import {
  AssistantCategory,
  DiscoverAssistantItem,
  DiscoverModelItem,
  DiscoverPlugintem,
  DiscoverProviderItem,
  PluginCategory,
} from '@/types/discover';

class DiscoverService {
  // Assistants

  searchAssistant = async (locale: string, keywords: string): Promise<DiscoverAssistantItem[]> => {
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
    locale: string,
    category: AssistantCategory,
  ): Promise<DiscoverAssistantItem[]> => {
    const assistantList = await this.getAssistantList(locale);
    return assistantList.filter((item) => item.meta.category === category);
  };

  getAssistantList = async (locale: string): Promise<DiscoverAssistantItem[]> => {
    return assistantService.getAssistantList(locale);
  };

  getAssistantById = async (locale: string, identifier: string): Promise<DiscoverAssistantItem> => {
    let assistant = await assistantService.getAssistantById(locale, identifier);

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

    return merge(cloneDeep(DEFAULT_DISCOVER_AGENT_ITEM), assistant);
  };

  // Tools

  searchTool = async (locale: string, keywords: string): Promise<DiscoverPlugintem[]> => {
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
    locale: string,
    category: PluginCategory,
  ): Promise<DiscoverPlugintem[]> => {
    const toolList = await this.getPluginList(locale);
    return toolList.filter((item) => item.meta.category === category);
  };

  getPluginList = async (locale: string): Promise<DiscoverPlugintem[]> => {
    return toolService.getToolList(locale);
  };

  getPluginByIds = async (locale: string, identifiers: string[]): Promise<DiscoverPlugintem[]> => {
    const toolList = await this.getPluginList(locale);
    return toolList.filter((item) => identifiers.includes(item.identifier));
  };

  getPluginById = async (
    locale: string,
    identifier: string,
    withManifest?: boolean,
  ): Promise<DiscoverPlugintem> => {
    let tool = await toolService.getToolById(locale, identifier);

    if (withManifest) {
      const manifest = isString(tool?.manifest)
        ? await toolService.getToolManifest(tool.manifest)
        : tool?.manifest;

      tool = {
        ...tool,
        manifest,
      } as DiscoverPlugintem;
    }

    const categoryItems = await this.getPluginCategory(
      locale,
      tool.meta.category || PluginCategory.Tools,
    );

    tool = {
      ...tool,
      suggestions: categoryItems
        .filter((item) => item.identifier !== tool.identifier)
        .slice(0, 5) as any,
    } as DiscoverPlugintem;

    return tool;
  };

  // Providers

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getProviderList = async (locale: string): Promise<DiscoverProviderItem[]> => {
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

  searchProvider = async (locale: string, keywords: string): Promise<DiscoverProviderItem[]> => {
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
    locale: string,
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
  private _getModelList = async (locale: string): Promise<DiscoverModelItem[]> => {
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

  getModelList = async (locale: string): Promise<DiscoverModelItem[]> => {
    const modelList = await this._getModelList(locale);

    return uniqBy(modelList, (item) => {
      const ids = item.identifier.split('/');
      return ids[1] || item.identifier;
    });
  };

  searchModel = async (locale: string, keywords: string): Promise<DiscoverModelItem[]> => {
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

  getModelCategory = async (locale: string, category: string): Promise<DiscoverModelItem[]> => {
    const modelList = await this._getModelList(locale);
    return modelList.filter((item) => item.meta.category === category);
  };

  getModelById = async (locale: string, id: string): Promise<DiscoverModelItem | undefined> => {
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

  getModelByIds = async (locale: string, identifiers: string[]): Promise<DiscoverModelItem[]> => {
    const modelList = await this.getModelList(locale);
    return modelList.filter((item) => identifiers.includes(item.identifier));
  };
}
export const discoverService = new DiscoverService();
