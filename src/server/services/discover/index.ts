import { CategoryItem, CategoryListQuery, MarketSDK } from '@lobehub/market-sdk';
import dayjs from 'dayjs';
import matter from 'gray-matter';
import { cloneDeep, countBy, isString, merge, uniq, uniqBy } from 'lodash-es';
import urlJoin from 'url-join';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import {
  DEFAULT_DISCOVER_ASSISTANT_ITEM,
  DEFAULT_DISCOVER_PLUGIN_ITEM,
  DEFAULT_DISCOVER_PROVIDER_ITEM,
} from '@/const/discover';
import { normalizeLocale } from '@/locales/resources';
import { AssistantStore } from '@/server/modules/AssistantStore';
import { PluginStore } from '@/server/modules/PluginStore';
import {
  AssistantListResponse,
  AssistantQueryParams,
  AssistantSorts,
  CacheRevalidate,
  CacheTag,
  DiscoverAssistantDetail,
  DiscoverAssistantItem,
  DiscoverMcpDetail,
  DiscoverModelDetail,
  DiscoverModelItem,
  DiscoverPluginDetail,
  DiscoverPluginItem,
  DiscoverProviderDetail,
  DiscoverProviderItem,
  IdentifiersResponse,
  McpListResponse,
  McpQueryParams,
  ModelListResponse,
  ModelQueryParams,
  ModelSorts,
  PluginListResponse,
  PluginQueryParams,
  PluginSorts,
  ProviderListResponse,
  ProviderQueryParams,
  ProviderSorts,
} from '@/types/discover';

export class DiscoverService {
  assistantStore = new AssistantStore();
  pluginStore = new PluginStore();
  market: MarketSDK;

  constructor() {
    this.market = new MarketSDK({ baseURL: process.env.MARKET_BASE_URL });
  }

  // ============================== Helper Methods ==============================

  /**
   * 计算 ModelAbilities 的完整度分数
   * 分数越高表示 abilities 越全
   */
  private calculateAbilitiesScore = (abilities?: any): number => {
    if (!abilities) return 0;

    let score = 0;
    const abilityWeights = {
      files: 1,
      functionCall: 1,
      imageOutput: 1,
      reasoning: 1,
      search: 1,
      vision: 1,
    };

    Object.entries(abilityWeights).forEach(([ability, weight]) => {
      if (abilities[ability]) {
        score += weight;
      }
    });

    return score;
  };

  /**
   * 在模型数组中选择 abilities 最全的模型
   * 组合最全的 abilities 和最大的 contextWindowTokens
   */
  private selectModelWithBestAbilities = (models: DiscoverModelItem[]): DiscoverModelItem => {
    if (models.length === 1) return models[0];

    // 找到最全的 abilities
    let bestAbilities: Record<string, boolean> = {};
    let maxAbilitiesScore = 0;
    models.forEach((model) => {
      const score = this.calculateAbilitiesScore(model.abilities);
      if (score > maxAbilitiesScore) {
        maxAbilitiesScore = score;
        bestAbilities = { ...(model.abilities as Record<string, boolean>) };
      } else if (score === maxAbilitiesScore && model.abilities) {
        // 合并相同分数的 abilities，确保获得最全的组合
        const abilities = model.abilities as Record<string, boolean>;
        Object.keys(abilities).forEach((key) => {
          if (abilities[key]) {
            bestAbilities[key] = true;
          }
        });
      }
    });

    // 找到最大的 contextWindowTokens
    const maxContextWindowTokens = Math.max(
      ...models.map((model) => model.contextWindowTokens || 0),
    );

    // 找到最新的 releasedAt
    const latestReleasedAt = models
      .map((model) => model.releasedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

    // 找到最短的 identifier
    const shortestIdentifier = models
      .map((model) => model.identifier)
      .reduce((shortest, current) => (current.length < shortest.length ? current : shortest));

    // 选择一个基础模型（通常选择第一个）
    const baseModel = models[0];

    // 组装最终模型，使用最佳的各项属性
    const result: DiscoverModelItem = {
      ...baseModel,
      abilities: bestAbilities as any,
      contextWindowTokens: maxContextWindowTokens || baseModel.contextWindowTokens,
      identifier: shortestIdentifier,
      releasedAt: latestReleasedAt || baseModel.releasedAt,
    };

    return result;
  };

  // ============================== Assistant Market ==============================

  private _getAssistantList = async (locale?: string): Promise<DiscoverAssistantItem[]> => {
    const normalizedLocale = normalizeLocale(locale);
    const list = await this.assistantStore.getAgentIndex(normalizedLocale);
    if (!list || !Array.isArray(list)) return [];
    return list.map(({ meta, ...item }) => ({ ...item, ...meta }));
  };

  getAssistantCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const { q, locale } = params;
    let list = await this._getAssistantList(locale);
    if (q) {
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
    }
    const categoryCounts = countBy(list, (item) => item.category);
    return Object.entries(categoryCounts)
      .filter(([category]) => Boolean(category)) // 过滤掉空值
      .map(([category, count]) => ({
        category,
        count,
      }));
  };

  getAssistantDetail = async (params: {
    identifier: string;
    locale?: string;
  }): Promise<DiscoverAssistantDetail | undefined> => {
    const { locale, identifier } = params;
    const normalizedLocale = normalizeLocale(locale);
    let data = await this.assistantStore.getAgent(identifier, normalizedLocale);
    if (!data) return;
    const { meta, ...item } = data;
    const assistant = merge(cloneDeep(DEFAULT_DISCOVER_ASSISTANT_ITEM), { ...item, ...meta });
    const list = await this.getAssistantList({
      category: assistant.category,
      locale,
      page: 1,
      pageSize: 7,
    });
    return {
      ...assistant,
      related: list.items.filter((item) => item.identifier !== assistant.identifier).slice(0, 6),
    };
  };

  getAssistantIdentifiers = async (): Promise<IdentifiersResponse> => {
    const list = await this._getAssistantList();
    return list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: item.createdAt,
      };
    });
  };

  getAssistantList = async (params: AssistantQueryParams = {}): Promise<AssistantListResponse> => {
    const {
      locale,
      category,
      order = 'desc',
      page = 1,
      pageSize = 20,
      q,
      sort = AssistantSorts.CreatedAt,
    } = params;
    let list = await this._getAssistantList(locale);

    if (category) {
      list = list.filter((item) => item.category === category);
    }

    if (q) {
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
    }

    if (sort) {
      switch (sort) {
        case AssistantSorts.CreatedAt: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
            } else {
              return dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix();
            }
          });
          break;
        }
        case AssistantSorts.KnowledgeCount: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return a.knowledgeCount - b.knowledgeCount;
            } else {
              return b.knowledgeCount - a.knowledgeCount;
            }
          });
          break;
        }
        case AssistantSorts.PluginCount: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return a.pluginCount - b.pluginCount;
            } else {
              return b.pluginCount - a.pluginCount;
            }
          });
          break;
        }
        case AssistantSorts.TokenUsage: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return a.tokenUsage - b.tokenUsage;
            } else {
              return b.tokenUsage - a.tokenUsage;
            }
          });
          break;
        }
        case AssistantSorts.Identifier: {
          list = list.sort((a, b) => {
            if (order !== 'desc') {
              return a.identifier.localeCompare(b.identifier);
            } else {
              return b.identifier.localeCompare(a.identifier);
            }
          });
          break;
        }
        case AssistantSorts.Title: {
          list = list.sort((a, b) => {
            if (order === 'desc') {
              return (a.title || a.identifier).localeCompare(b.title || b.identifier);
            } else {
              return (b.title || b.identifier).localeCompare(a.title || a.identifier);
            }
          });
          break;
        }
      }
    }

    return {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
  };

  // ============================== MCP Market ==============================

  getMcpCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    return this.market.plugins.getCategories(
      {
        ...params,
        locale: normalizedLocale,
      },
      {
        cache: 'force-cache',
        next: {
          revalidate: CacheRevalidate.List,
          tags: [CacheTag.Discover, CacheTag.MCP],
        },
      },
    );
  };

  getMcpDetail = async (params: {
    identifier: string;
    locale?: string;
    version?: string;
  }): Promise<DiscoverMcpDetail> => {
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    const mcp = await this.market.plugins.getPluginDetail(
      { ...params, locale: normalizedLocale },
      {
        cache: 'force-cache',
        next: {
          revalidate: CacheRevalidate.Details,
          tags: [CacheTag.Discover, CacheTag.MCP],
        },
      },
    );
    const list = await this.getMcpList({
      category: mcp.category,
      locale,
      page: 1,
      pageSize: 7,
    });
    return {
      ...mcp,
      related: list.items.filter((item) => item.identifier !== mcp.identifier).slice(0, 6),
    };
  };

  getMcpIdentifiers = async (): Promise<IdentifiersResponse> => {
    return this.market.plugins.getPublishedIdentifiers({
      cache: 'force-cache',
      next: {
        revalidate: CacheRevalidate.List,
        tags: [CacheTag.Discover, CacheTag.MCP],
      },
    });
  };

  getMcpList = async (params: McpQueryParams = {}): Promise<McpListResponse> => {
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    return this.market.plugins.getPluginList(
      {
        ...params,
        locale: normalizedLocale,
      },
      {
        cache: 'force-cache',
        next: {
          revalidate: CacheRevalidate.List,
          tags: [CacheTag.Discover, CacheTag.MCP],
        },
      },
    );
  };

  getMcpManifest = async (params: { identifier: string; locale?: string; version?: string }) => {
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    return this.market.plugins.getPluginManifest(
      {
        ...params,
        locale: normalizedLocale,
      },
      {
        cache: 'force-cache',
        next: {
          revalidate: CacheRevalidate.List,
          tags: [CacheTag.Discover, CacheTag.MCP],
        },
      },
    );
  };

  // ============================== Plugin Market ==============================

  private _getPluginList = async (locale?: string): Promise<DiscoverPluginItem[]> => {
    const normalizedLocale = normalizeLocale(locale);
    const list = await this.pluginStore.getPluginList(normalizedLocale);
    if (!list || !Array.isArray(list)) return [];
    return list.map(({ meta, ...item }) => ({ ...item, ...meta }));
  };

  getLegacyPluginList = async ({ locale }: { locale?: string } = {}): Promise<any> => {
    const normalizedLocale = normalizeLocale(locale);
    return this.pluginStore.getPluginList(normalizedLocale);
  };

  getPluginCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const { q, locale } = params;
    let list = await this._getPluginList(locale);
    if (q) {
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
    }
    const categoryCounts = countBy(list, (item) => item.category);
    return Object.entries(categoryCounts)
      .filter(([category]) => Boolean(category)) // 过滤掉空值
      .map(([category, count]) => ({
        category,
        count,
      }));
  };

  getPluginDetail = async (params: {
    identifier: string;
    locale?: string;
    withManifest?: boolean;
  }): Promise<DiscoverPluginDetail | undefined> => {
    const { locale, identifier, withManifest } = params;
    const all = await this._getPluginList(locale);
    let raw = all.find((item) => item.identifier === identifier);
    if (!raw) return;

    raw = merge(cloneDeep(DEFAULT_DISCOVER_PLUGIN_ITEM), raw);
    const list = await this.getPluginList({
      category: raw.category,
      locale,
      page: 1,
      pageSize: 7,
    });

    let plugin = {
      ...raw,
      related: list.items.filter((item) => item.identifier !== raw.identifier).slice(0, 6),
    };

    if (!withManifest || !plugin?.manifest || !isString(plugin?.manifest)) return plugin;

    // 在 Edge Runtime 环境中使用了 Node.js 的 path 模块，但 Edge Runtime 不支持所有 Node.js API
    // 这个函数使用了 @lobehub/chat-plugin-sdk/openapi，该包最终依赖了 @apidevtools/swagger-parser，而这个包在 Edge Runtime 环境中使用了不被支持的 Node.js path 模块。
    // try {
    //   const manifest = await getToolManifest(plugin.manifest);
    //
    //   return {
    //     ...plugin,
    //     manifest,
    //   };
    // } catch {
    //   return plugin;
    // }

    return plugin;
  };

  getPluginIdentifiers = async (): Promise<IdentifiersResponse> => {
    const list = await this._getPluginList();
    return list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: item.createdAt,
      };
    });
  };

  getPluginList = async (params: PluginQueryParams = {}): Promise<PluginListResponse> => {
    const {
      locale,
      category,
      order = 'desc',
      page = 1,
      pageSize = 20,
      q,
      sort = PluginSorts.CreatedAt,
    } = params;

    let list = await this._getPluginList(locale);

    if (category) {
      list = list.filter((item) => item.category === category);
    }

    if (q) {
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
    }

    if (sort) {
      switch (sort) {
        case PluginSorts.CreatedAt: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
            } else {
              return dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix();
            }
          });
          break;
        }
        case PluginSorts.Identifier: {
          list = list.sort((a, b) => {
            if (order === 'desc') {
              return a.identifier.localeCompare(b.identifier);
            } else {
              return b.identifier.localeCompare(a.identifier);
            }
          });
          break;
        }
        case PluginSorts.Title: {
          list = list.sort((a, b) => {
            if (order === 'desc') {
              return a.title.localeCompare(b.title);
            } else {
              return b.title.localeCompare(a.title);
            }
          });
          break;
        }
      }
    }

    return {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
  };

  // ============================== Providers ==============================

  private _getProviderList = async (): Promise<DiscoverProviderItem[]> => {
    return DEFAULT_MODEL_PROVIDER_LIST.map((item) => {
      const models = uniq(
        LOBE_DEFAULT_MODEL_LIST.filter((m) => m.providerId === item.id).map((m) => m.id),
      );
      const provider = {
        ...item,
        identifier: item.id,
        modelCount: models.length,
        models,
      };
      return merge(cloneDeep(DEFAULT_DISCOVER_PROVIDER_ITEM), provider);
    });
  };

  getProviderDetail = async (params: {
    identifier: string;
    locale?: string;
    withReadme?: boolean;
  }): Promise<DiscoverProviderDetail | undefined> => {
    const { identifier, locale, withReadme } = params;
    const all = await this._getProviderList();
    let provider = all.find((item) => item.identifier === identifier);
    if (!provider) return;

    const list = await this.getProviderList({
      page: 1,
      pageSize: 7,
    });

    let readme;

    if (withReadme) {
      try {
        const normalizedLocale = normalizeLocale(locale);
        const res = await fetch(
          urlJoin(
            'https://raw.githubusercontent.com/lobehub/lobe-chat/refs/heads/main/docs/usage/providers',
            normalizedLocale === 'zh-CN' ? `${identifier}.zh-CN.mdx` : `${identifier}.mdx`,
          ),
          {
            cache: 'force-cache',
            next: {
              tags: [CacheTag.Discover, CacheTag.Providers],
            },
          },
        );

        const data = await res.text();
        const { content } = matter(data);
        readme = content.trimEnd();
      } catch {}
    }

    return {
      ...provider,
      models: uniqBy(
        LOBE_DEFAULT_MODEL_LIST.filter((m) => m.providerId === provider.id),
        (item) => item.id,
      ),
      readme,
      related: list.items.filter((item) => item.identifier !== provider.identifier).slice(0, 6),
    };
  };

  getProviderIdentifiers = async (): Promise<IdentifiersResponse> => {
    const list = await this._getProviderList();
    return list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: dayjs().toISOString(),
      };
    });
  };

  getProviderList = async (params: ProviderQueryParams = {}): Promise<ProviderListResponse> => {
    const { page = 1, pageSize = 20, q, sort = ProviderSorts.Default, order = 'desc' } = params;
    let list = await this._getProviderList();

    if (q) {
      list = list.filter((item) => {
        return [item.identifier, item.description, item.name]
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
    }

    if (sort) {
      switch (sort) {
        case ProviderSorts.Identifier: {
          list = list.sort((a, b) => {
            if (order === 'desc') {
              return a.identifier.localeCompare(b.identifier);
            } else {
              return b.identifier.localeCompare(a.identifier);
            }
          });
          break;
        }
        case ProviderSorts.ModelCount: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return a.modelCount - b.modelCount;
            } else {
              return b.modelCount - a.modelCount;
            }
          });
          break;
        }
      }
    }

    return {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
  };

  // ============================== Models ==============================

  private _getRawModelList = async (): Promise<DiscoverModelItem[]> => {
    return LOBE_DEFAULT_MODEL_LIST.map((item) => {
      const identifier = (item.id.split('/').at(-1) || item.id).toLowerCase();
      const providers = uniq(
        LOBE_DEFAULT_MODEL_LIST.filter(
          (m) =>
            m.id.toLowerCase() === identifier ||
            m.id.includes(`/${identifier}`) ||
            m.displayName?.toLowerCase() === item.displayName?.toLowerCase(),
        ).map((m) => m.providerId),
      );
      const model = {
        ...item,
        category: item.providerId,
        identifier,
        providerCount: providers.length,
        providers,
      };
      // 使用简单的合并而不是 DEFAULT_DISCOVER_MODEL_ITEM，避免类型冲突
      return {
        ...model,
        abilities: model.abilities || {},
      } as DiscoverModelItem;
    });
  };

  private _getModelList = async (category?: string): Promise<DiscoverModelItem[]> => {
    let list = await this._getRawModelList();

    if (category) {
      list = list.filter((item) => item.providerId === category);
    }

    // 优化去重逻辑：选择 abilities 最全的模型
    // 1. 按 identifier 分组
    const identifierGroups = new Map<string, DiscoverModelItem[]>();
    list.forEach((item) => {
      const key = item.identifier;
      if (!identifierGroups.has(key)) {
        identifierGroups.set(key, []);
      }
      identifierGroups.get(key)!.push(item);
    });

    // 2. 从每个 identifier 组中选择 abilities 最全的
    let deduplicatedByIdentifier = Array.from(identifierGroups.values()).map((models) =>
      this.selectModelWithBestAbilities(models),
    );

    // 3. 按 displayName 分组
    const displayNameGroups = new Map<string, DiscoverModelItem[]>();
    deduplicatedByIdentifier.forEach((item) => {
      const key = item.displayName?.toLowerCase() || '';
      if (!displayNameGroups.has(key)) {
        displayNameGroups.set(key, []);
      }
      displayNameGroups.get(key)!.push(item);
    });

    // 4. 从每个 displayName 组中选择 abilities 最全的
    const finalList: DiscoverModelItem[] = Array.from(displayNameGroups.values()).map((models) =>
      this.selectModelWithBestAbilities(models),
    );

    return finalList;
  };

  getModelCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const { q } = params;
    let list = LOBE_DEFAULT_MODEL_LIST;
    if (q) {
      list = list.filter((item) => {
        return [item.id, item.displayName, item.description]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
    }
    const categoryCounts = countBy(list, (item) => item.providerId);
    return Object.entries(categoryCounts)
      .filter(([category]) => Boolean(category)) // 过滤掉空值
      .map(([category, count]) => ({
        category,
        count,
      }));
  };

  getModelDetail = async (params: {
    identifier: string;
  }): Promise<DiscoverModelDetail | undefined> => {
    const { identifier } = params;
    const all = await this._getModelList();
    let model = all.find((item) => item.identifier.toLowerCase() === identifier.toLowerCase());

    if (!model) {
      const raw = await this._getRawModelList();
      model = raw.find((item) => item.identifier.toLowerCase() === identifier.toLowerCase());
    }

    if (!model) return;

    const providers = DEFAULT_MODEL_PROVIDER_LIST.filter((item) =>
      model.providers?.includes(item.id),
    );

    const list = await this.getModelList({
      page: 1,
      pageSize: 7,
      q: model.identifier.split('-')[0],
    });

    return {
      ...model,
      providers: providers.map((item) => ({
        ...item,
        model: LOBE_DEFAULT_MODEL_LIST.find((m) => {
          if (m.providerId !== item.id) return false;
          return (
            m.id.toLowerCase() === model.identifier.toLowerCase() ||
            m.id.toLowerCase().includes(`/${model.identifier.toLowerCase()}`) ||
            m.displayName?.toLowerCase() === model.displayName?.toLowerCase()
          );
        }),
      })),
      related: list.items
        .filter(
          (item) => item.identifier !== model.identifier && item.displayName !== model?.displayName,
        )
        .slice(0, 6),
    };
  };

  getModelIdentifiers = async (): Promise<IdentifiersResponse> => {
    const list = await this._getModelList();
    return list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: item.releasedAt || dayjs().toISOString(),
      };
    });
  };

  getModelList = async (params: ModelQueryParams = {}): Promise<ModelListResponse> => {
    const {
      category,
      order = 'desc',
      page = 1,
      pageSize = 20,
      q,
      sort = ModelSorts.ReleasedAt,
    } = params;
    let list = await this._getModelList(category);

    // if (category) {
    //   list = list.filter((item) => item.category === category);
    // }

    if (q) {
      list = list.filter((item) => {
        return [item.identifier, item.displayName, item.description]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
    }

    if (sort) {
      switch (sort) {
        case ModelSorts.ReleasedAt: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return dayjs(a.releasedAt).unix() - dayjs(b.releasedAt).unix();
            } else {
              return dayjs(b.releasedAt).unix() - dayjs(a.releasedAt).unix();
            }
          });
          break;
        }
        case ModelSorts.Identifier: {
          list = list.sort((a, b) => {
            if (order === 'desc') {
              return a.identifier.localeCompare(b.identifier);
            } else {
              return b.identifier.localeCompare(a.identifier);
            }
          });
          break;
        }
        case ModelSorts.InputPrice: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return (
                (a.pricing?.input || a.pricing?.audioInput || 0) -
                (b.pricing?.input || b.pricing?.audioInput || 0)
              );
            } else {
              return (
                (b.pricing?.input || b.pricing?.audioInput || 0) -
                (a.pricing?.input || a.pricing?.audioInput || 0)
              );
            }
          });
          break;
        }
        case ModelSorts.OutputPrice: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return (a.pricing?.output || 0) - (b.pricing?.output || 0);
            } else {
              return (b.pricing?.output || 0) - (a.pricing?.output || 0);
            }
          });
          break;
        }
        case ModelSorts.ContextWindowTokens: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return (a.contextWindowTokens || 0) - (b.contextWindowTokens || 0);
            } else {
              return (b.contextWindowTokens || 0) - (a.contextWindowTokens || 0);
            }
          });
          break;
        }
        case ModelSorts.ProviderCount: {
          list = list.sort((a, b) => {
            if (order === 'asc') {
              return a.providerCount - b.providerCount;
            } else {
              return b.providerCount - a.providerCount;
            }
          });
          break;
        }
      }
    }

    return {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
  };
}
