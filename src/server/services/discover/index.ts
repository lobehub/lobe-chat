import { CategoryItem, CategoryListQuery, MarketSDK } from '@lobehub/market-sdk';
import { CallReportRequest, InstallReportRequest } from '@lobehub/market-types';
import dayjs from 'dayjs';
import debug from 'debug';
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
import { CURRENT_VERSION, isDesktop } from '@/const/version';
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

const log = debug('lobe-server:discover');

export class DiscoverService {
  assistantStore = new AssistantStore();
  pluginStore = new PluginStore();
  market: MarketSDK;

  constructor({ accessToken }: { accessToken?: string } = {}) {
    this.market = new MarketSDK({
      accessToken,
      baseURL: process.env.MARKET_BASE_URL,
    });
    log('DiscoverService initialized with market baseURL: %s', process.env.MARKET_BASE_URL);
  }

  async registerClient({ userAgent }: { userAgent?: string }) {
    const getDeviceId = async (): Promise<string> => {
      // 1. Vercel 环境下使用 VERCEL_PROJECT_ID
      if (process.env.VERCEL_PROJECT_ID) {
        return process.env.VERCEL_PROJECT_ID;
      }

      // 2. 桌面端使用 machine-id
      if (isDesktop) {
        try {
          // 动态导入
          const { machineId } = await import('node-machine-id');
          return await machineId();
        } catch (error) {
          console.error('Failed to get machine-id:', error);
        }
      }

      return 'unknown-device';
    };

    const deviceId = await getDeviceId();

    const { client_id, client_secret } = await this.market.registerClient({
      clientName: `LobeHub ${isDesktop ? 'Desktop' : 'Web'}`,
      clientType: isDesktop ? 'desktop' : 'web',
      deviceId,
      platform: isDesktop ? process.platform : userAgent,
      version: CURRENT_VERSION,
    });

    return { clientId: client_id, clientSecret: client_secret };
  }

  async fetchM2MToken(params: { clientId: string; clientSecret: string }) {
    // 使用传入的客户端凭证创建新的 MarketSDK 实例
    const tokenMarket = new MarketSDK({
      baseURL: process.env.MARKET_BASE_URL,
      clientId: params.clientId,
      clientSecret: params.clientSecret,
    });

    const tokenInfo = await tokenMarket.fetchM2MToken();

    return {
      accessToken: tokenInfo.accessToken,
      expiresIn: tokenInfo.expiresIn,
    };
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

    log('calculateAbilitiesScore: abilities=%O, score=%d', abilities, score);
    return score;
  };

  /**
   * 在模型数组中选择 abilities 最全的模型
   * 组合最全的 abilities 和最大的 contextWindowTokens
   */
  private selectModelWithBestAbilities = (models: DiscoverModelItem[]): DiscoverModelItem => {
    log('selectModelWithBestAbilities: input models count=%d', models.length);
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

    log('selectModelWithBestAbilities: selected model=%O', {
      abilities: result.abilities,
      contextWindowTokens: result.contextWindowTokens,
      identifier: result.identifier,
      releasedAt: result.releasedAt,
    });
    return result;
  };

  // ============================== Assistant Market ==============================

  private _getAssistantList = async (locale?: string): Promise<DiscoverAssistantItem[]> => {
    log('_getAssistantList: locale=%s', locale);
    const normalizedLocale = normalizeLocale(locale);
    const list = await this.assistantStore.getAgentIndex(normalizedLocale);
    if (!list || !Array.isArray(list)) {
      log('_getAssistantList: no valid list found, returning empty array');
      return [];
    }
    const result = list.map(({ meta, ...item }) => ({ ...item, ...meta }));
    log('_getAssistantList: returning %d items', result.length);
    return result;
  };

  getAssistantCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    log('getAssistantCategories: params=%O', params);
    const { q, locale } = params;
    let list = await this._getAssistantList(locale);
    if (q) {
      const originalCount = list.length;
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
      log(
        'getAssistantCategories: filtered by query "%s", %d -> %d items',
        q,
        originalCount,
        list.length,
      );
    }
    const categoryCounts = countBy(list, (item) => item.category);
    const result = Object.entries(categoryCounts)
      .filter(([category]) => Boolean(category)) // 过滤掉空值
      .map(([category, count]) => ({
        category,
        count,
      }));
    log('getAssistantCategories: returning %d categories', result.length);
    return result;
  };

  getAssistantDetail = async (params: {
    identifier: string;
    locale?: string;
  }): Promise<DiscoverAssistantDetail | undefined> => {
    log('getAssistantDetail: params=%O', params);
    const { locale, identifier } = params;
    const normalizedLocale = normalizeLocale(locale);
    let data = await this.assistantStore.getAgent(identifier, normalizedLocale);
    if (!data) {
      log('getAssistantDetail: assistant not found for identifier=%s', identifier);
      return;
    }
    const { meta, ...item } = data;
    const assistant = merge(cloneDeep(DEFAULT_DISCOVER_ASSISTANT_ITEM), { ...item, ...meta });
    const list = await this.getAssistantList({
      category: assistant.category,
      locale,
      page: 1,
      pageSize: 7,
    });
    const result = {
      ...assistant,
      related: list.items.filter((item) => item.identifier !== assistant.identifier).slice(0, 6),
    };
    log('getAssistantDetail: returning assistant with %d related items', result.related.length);
    return result;
  };

  getAssistantIdentifiers = async (): Promise<IdentifiersResponse> => {
    log('getAssistantIdentifiers: fetching identifiers');
    const list = await this._getAssistantList();
    const result = list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: item.createdAt,
      };
    });
    log('getAssistantIdentifiers: returning %d identifiers', result.length);
    return result;
  };

  getAssistantList = async (params: AssistantQueryParams = {}): Promise<AssistantListResponse> => {
    log('getAssistantList: params=%O', params);
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
    const originalCount = list.length;

    if (category) {
      list = list.filter((item) => item.category === category);
      log(
        'getAssistantList: filtered by category "%s", %d -> %d items',
        category,
        originalCount,
        list.length,
      );
    }

    if (q) {
      const beforeFilter = list.length;
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
      log('getAssistantList: filtered by query "%s", %d -> %d items', q, beforeFilter, list.length);
    }

    if (sort) {
      log('getAssistantList: sorting by %s %s', sort, order);
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

    const result = {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
    log(
      'getAssistantList: returning page %d/%d with %d items',
      page,
      result.totalPages,
      result.items.length,
    );
    return result;
  };

  // ============================== MCP Market ==============================

  getMcpCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    log('getMcpCategories: params=%O', params);
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    const result = await this.market.plugins.getCategories(
      {
        ...params,
        locale: normalizedLocale,
      },
      {
        next: {
          revalidate: 3600,
        },
      },
    );
    log('getMcpCategories: returning %d categories', result.length);
    return result;
  };

  getMcpDetail = async (params: {
    identifier: string;
    locale?: string;
    version?: string;
  }): Promise<DiscoverMcpDetail> => {
    log('getMcpDetail: params=%O', params);
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    const mcp = await this.market.plugins.getPluginDetail(
      { ...params, locale: normalizedLocale },
      {
        next: {
          revalidate: 3600,
        },
      },
    );
    const list = await this.getMcpList({
      category: mcp.category,
      locale,
      page: 1,
      pageSize: 7,
    });
    const result = {
      ...mcp,
      related: list.items.filter((item) => item.identifier !== mcp.identifier).slice(0, 6),
    };
    log('getMcpDetail: returning mcp with %d related items', result.related.length);
    return result;
  };

  getMcpIdentifiers = async (): Promise<IdentifiersResponse> => {
    log('getMcpIdentifiers: fetching identifiers');
    const result = await this.market.plugins.getPublishedIdentifiers({
      cache: 'force-cache',
      next: {
        revalidate: CacheRevalidate.List,
        tags: [CacheTag.Discover, CacheTag.MCP],
      },
    });
    log('getMcpIdentifiers: returning %d identifiers', result.length);
    return result;
  };

  getMcpList = async (params: McpQueryParams = {}): Promise<McpListResponse> => {
    log('getMcpList: params=%O', params);
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    const result = await this.market.plugins.getPluginList(
      {
        ...params,
        locale: normalizedLocale,
      },
      {
        next: {
          revalidate: CacheRevalidate.List,
          tags: [CacheTag.Discover, CacheTag.MCP],
        },
      },
    );
    log('getMcpList: returning %d items on page %d', result.items.length, result.currentPage);
    return result;
  };

  getMcpManifest = async (params: { identifier: string; locale?: string; version?: string }) => {
    log('getMcpManifest: params=%O', params);
    const { locale } = params;
    const normalizedLocale = normalizeLocale(locale);
    const result = await this.market.plugins.getPluginManifest(
      {
        ...params,
        locale: normalizedLocale,
      },
      {
        next: {
          revalidate: CacheRevalidate.List,
          tags: [CacheTag.Discover, CacheTag.MCP],
        },
      },
    );
    log('getMcpManifest: returning manifest for %s', params.identifier);
    return result;
  };

  // ============================== MCP Analytics ==============================

  /**
   * report MCP plugin result marketplace
   */
  reportPluginInstallation = async (params: InstallReportRequest) => {
    await this.market.plugins.reportInstallation(params);
  };

  /**
   * report plugin call result to marketplace
   */
  reportCall = async (params: CallReportRequest) => {
    await this.market.plugins.reportCall(params);
  };

  // ============================== Plugin Market ==============================

  private _getPluginList = async (locale?: string): Promise<DiscoverPluginItem[]> => {
    log('_getPluginList: locale=%s', locale);
    const normalizedLocale = normalizeLocale(locale);
    const list = await this.pluginStore.getPluginList(normalizedLocale);
    if (!list || !Array.isArray(list)) {
      log('_getPluginList: no valid list found, returning empty array');
      return [];
    }
    const result = list.map(({ meta, ...item }) => ({ ...item, ...meta }));
    log('_getPluginList: returning %d items', result.length);
    return result;
  };

  getLegacyPluginList = async ({ locale }: { locale?: string } = {}): Promise<any> => {
    log('getLegacyPluginList: locale=%s', locale);
    const normalizedLocale = normalizeLocale(locale);
    const result = await this.pluginStore.getPluginList(normalizedLocale);
    log('getLegacyPluginList: returning plugin list');
    return result;
  };

  getPluginCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    log('getPluginCategories: params=%O', params);
    const { q, locale } = params;
    let list = await this._getPluginList(locale);
    if (q) {
      const originalCount = list.length;
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
      log(
        'getPluginCategories: filtered by query "%s", %d -> %d items',
        q,
        originalCount,
        list.length,
      );
    }
    const categoryCounts = countBy(list, (item) => item.category);
    const result = Object.entries(categoryCounts)
      .filter(([category]) => Boolean(category)) // 过滤掉空值
      .map(([category, count]) => ({
        category,
        count,
      }));
    log('getPluginCategories: returning %d categories', result.length);
    return result;
  };

  getPluginDetail = async (params: {
    identifier: string;
    locale?: string;
    withManifest?: boolean;
  }): Promise<DiscoverPluginDetail | undefined> => {
    log('getPluginDetail: params=%O', params);
    const { locale, identifier, withManifest } = params;
    const all = await this._getPluginList(locale);
    let raw = all.find((item) => item.identifier === identifier);
    if (!raw) {
      log('getPluginDetail: plugin not found for identifier=%s', identifier);
      return;
    }

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

    if (!withManifest || !plugin?.manifest || !isString(plugin?.manifest)) {
      log('getPluginDetail: returning plugin without manifest processing');
      return plugin;
    }

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
    log('getPluginIdentifiers: fetching identifiers');
    const list = await this._getPluginList();
    const result = list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: item.createdAt,
      };
    });
    log('getPluginIdentifiers: returning %d identifiers', result.length);
    return result;
  };

  getPluginList = async (params: PluginQueryParams = {}): Promise<PluginListResponse> => {
    log('getPluginList: params=%O', params);
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
    const originalCount = list.length;

    if (category) {
      list = list.filter((item) => item.category === category);
      log(
        'getPluginList: filtered by category "%s", %d -> %d items',
        category,
        originalCount,
        list.length,
      );
    }

    if (q) {
      const beforeFilter = list.length;
      list = list.filter((item) => {
        return [item.author, item.title, item.description, item?.tags]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
      log('getPluginList: filtered by query "%s", %d -> %d items', q, beforeFilter, list.length);
    }

    if (sort) {
      log('getPluginList: sorting by %s %s', sort, order);
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

    const result = {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
    log(
      'getPluginList: returning page %d/%d with %d items',
      page,
      result.totalPages,
      result.items.length,
    );
    return result;
  };

  // ============================== Providers ==============================

  private _getProviderList = async (): Promise<DiscoverProviderItem[]> => {
    log('_getProviderList: fetching provider list');
    const result = DEFAULT_MODEL_PROVIDER_LIST.map((item) => {
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
    log('_getProviderList: returning %d providers', result.length);
    return result;
  };

  getProviderDetail = async (params: {
    identifier: string;
    locale?: string;
    withReadme?: boolean;
  }): Promise<DiscoverProviderDetail | undefined> => {
    log('getProviderDetail: params=%O', params);
    const { identifier, locale, withReadme } = params;
    const all = await this._getProviderList();
    let provider = all.find((item) => item.identifier === identifier);
    if (!provider) {
      log('getProviderDetail: provider not found for identifier=%s', identifier);
      return;
    }

    const list = await this.getProviderList({
      page: 1,
      pageSize: 7,
    });

    let readme;

    if (withReadme) {
      log('getProviderDetail: fetching readme for provider=%s', identifier);
      try {
        const normalizedLocale = normalizeLocale(locale);
        const readmeUrl = urlJoin(
          'https://raw.githubusercontent.com/lobehub/lobe-chat/refs/heads/main/docs/usage/providers',
          normalizedLocale === 'zh-CN' ? `${identifier}.zh-CN.mdx` : `${identifier}.mdx`,
        );
        log('getProviderDetail: readme URL=%s', readmeUrl);
        const res = await fetch(readmeUrl, {
          next: {
            tags: [CacheTag.Discover, CacheTag.Providers],
          },
        });

        const data = await res.text();
        const { content } = matter(data);
        readme = content.trimEnd();
        log('getProviderDetail: readme loaded successfully, length=%d', readme.length);
      } catch (error) {
        log(
          'getProviderDetail: failed to load readme for provider=%s, error: %O',
          identifier,
          error,
        );
      }
    }

    const result = {
      ...provider,
      models: uniqBy(
        LOBE_DEFAULT_MODEL_LIST.filter((m) => m.providerId === provider.id),
        (item) => item.id,
      ),
      readme,
      related: list.items.filter((item) => item.identifier !== provider.identifier).slice(0, 6),
    };
    log(
      'getProviderDetail: returning provider with %d models and %d related items',
      result.models.length,
      result.related.length,
    );
    return result;
  };

  getProviderIdentifiers = async (): Promise<IdentifiersResponse> => {
    log('getProviderIdentifiers: fetching identifiers');
    const list = await this._getProviderList();
    const result = list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: dayjs().toISOString(),
      };
    });
    log('getProviderIdentifiers: returning %d identifiers', result.length);
    return result;
  };

  getProviderList = async (params: ProviderQueryParams = {}): Promise<ProviderListResponse> => {
    log('getProviderList: params=%O', params);
    const { page = 1, pageSize = 20, q, sort = ProviderSorts.Default, order = 'desc' } = params;
    let list = await this._getProviderList();
    const originalCount = list.length;

    if (q) {
      list = list.filter((item) => {
        return [item.identifier, item.description, item.name]
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
      log('getProviderList: filtered by query "%s", %d -> %d items', q, originalCount, list.length);
    }

    if (sort) {
      log('getProviderList: sorting by %s %s', sort, order);
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

    const result = {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
    log(
      'getProviderList: returning page %d/%d with %d items',
      page,
      result.totalPages,
      result.items.length,
    );
    return result;
  };

  // ============================== Models ==============================

  private _getRawModelList = async (): Promise<DiscoverModelItem[]> => {
    log('_getRawModelList: fetching raw model list');
    const result = LOBE_DEFAULT_MODEL_LIST.map((item) => {
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
    log('_getRawModelList: returning %d raw models', result.length);
    return result;
  };

  private _getModelList = async (category?: string): Promise<DiscoverModelItem[]> => {
    log('_getModelList: category=%s', category);
    let list = await this._getRawModelList();
    const originalCount = list.length;

    if (category) {
      list = list.filter((item) => item.providerId === category);
      log(
        '_getModelList: filtered by category "%s", %d -> %d items',
        category,
        originalCount,
        list.length,
      );
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

    log(
      '_getModelList: grouped %d items into %d identifier groups',
      list.length,
      identifierGroups.size,
    );

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

    log(
      '_getModelList: grouped %d items into %d displayName groups',
      deduplicatedByIdentifier.length,
      displayNameGroups.size,
    );

    // 4. 从每个 displayName 组中选择 abilities 最全的
    const finalList: DiscoverModelItem[] = Array.from(displayNameGroups.values()).map((models) =>
      this.selectModelWithBestAbilities(models),
    );

    log('_getModelList: returning %d deduplicated models', finalList.length);
    return finalList;
  };

  getModelCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    log('getModelCategories: params=%O', params);
    const { q } = params;
    let list = LOBE_DEFAULT_MODEL_LIST;
    if (q) {
      const originalCount = list.length;
      list = list.filter((item) => {
        return [item.id, item.displayName, item.description]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
      log(
        'getModelCategories: filtered by query "%s", %d -> %d items',
        q,
        originalCount,
        list.length,
      );
    }
    const categoryCounts = countBy(list, (item) => item.providerId);
    const result = Object.entries(categoryCounts)
      .filter(([category]) => Boolean(category)) // 过滤掉空值
      .map(([category, count]) => ({
        category,
        count,
      }));
    log('getModelCategories: returning %d categories', result.length);
    return result;
  };

  getModelDetail = async (params: {
    identifier: string;
  }): Promise<DiscoverModelDetail | undefined> => {
    log('getModelDetail: params=%O', params);
    const { identifier } = params;
    const all = await this._getModelList();
    let model = all.find((item) => item.identifier.toLowerCase() === identifier.toLowerCase());

    if (!model) {
      log('getModelDetail: model not found in deduplicated list, searching raw list');
      const raw = await this._getRawModelList();
      model = raw.find((item) => item.identifier.toLowerCase() === identifier.toLowerCase());
    }

    if (!model) {
      log('getModelDetail: model not found for identifier=%s', identifier);
      return;
    }

    const providers = DEFAULT_MODEL_PROVIDER_LIST.filter((item) =>
      model.providers?.includes(item.id),
    );
    log('getModelDetail: found %d providers for model %s', providers.length, model.identifier);

    const list = await this.getModelList({
      page: 1,
      pageSize: 7,
      q: model.identifier.split('-')[0],
    });

    const result = {
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
    log(
      'getModelDetail: returning model with %d providers and %d related items',
      result.providers.length,
      result.related.length,
    );
    return result;
  };

  getModelIdentifiers = async (): Promise<IdentifiersResponse> => {
    log('getModelIdentifiers: fetching identifiers');
    const list = await this._getModelList();
    const result = list.map((item) => {
      return {
        identifier: item.identifier,
        lastModified: item.releasedAt || dayjs().toISOString(),
      };
    });
    log('getModelIdentifiers: returning %d identifiers', result.length);
    return result;
  };

  getModelList = async (params: ModelQueryParams = {}): Promise<ModelListResponse> => {
    log('getModelList: params=%O', params);
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
      const beforeFilter = list.length;
      list = list.filter((item) => {
        return [item.identifier, item.displayName, item.description]
          .flat()
          .filter(Boolean)
          .join(',')
          .toLowerCase()
          .includes(decodeURIComponent(q).toLowerCase());
      });
      log('getModelList: filtered by query "%s", %d -> %d items', q, beforeFilter, list.length);
    }

    if (sort) {
      log('getModelList: sorting by %s %s', sort, order);
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

    const result = {
      currentPage: page,
      items: list.slice((page - 1) * pageSize, page * pageSize),
      pageSize,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
    log(
      'getModelList: returning page %d/%d with %d items',
      page,
      result.totalPages,
      result.items.length,
    );
    return result;
  };
}
