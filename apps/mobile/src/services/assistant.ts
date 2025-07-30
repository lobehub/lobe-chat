import { DEFAULT_LANG, isLocaleNotSupport } from '@/const/locale';
import { normalizeLocale } from '@/i18n/resource';
import urlJoin from 'url-join';
import { DEFAULT_AGENT_INDEX } from '@/const/meta';
import { Locales } from '@/types/locale';
import { DiscoverAssistantItem } from '@/types/discover';
import { cloneDeep, merge } from 'lodash-es';
import { DEFAULT_DISCOVER_ASSISTANT_ITEM } from '@/const/discover';
import { apiLogger } from '@/utils/logger';

export class AssistantService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || DEFAULT_AGENT_INDEX;
  }

  private getAssistantIndexUrl = (lang: Locales = DEFAULT_LANG) => {
    if (isLocaleNotSupport(lang)) return this.baseUrl;
    return urlJoin(this.baseUrl, `index.${normalizeLocale(lang)}.json`);
  };

  private getAssistantUrl = (identifier: string, lang: Locales = DEFAULT_LANG) => {
    if (isLocaleNotSupport(lang)) return urlJoin(this.baseUrl, `${identifier}.json`);

    return urlJoin(this.baseUrl, `${identifier}.${normalizeLocale(lang)}.json`);
  };

  /**
   * 获取助手列表
   * 从 Lobe Hub 的助手市场获取助手列表
   * 实际上从 GitHub 仓库 https://github.com/lobehub/lobe-chat-agents 获取数据
   */
  getAssistantList = async (locale: Locales = DEFAULT_LANG): Promise<DiscoverAssistantItem[]> => {
    try {
      const response = await fetch(this.getAssistantIndexUrl(locale));
      const data = await response.json();
      return (data.agents as DiscoverAssistantItem[]) || [];
    } catch (error) {
      apiLogger.error('获取助手列表失败:', error);
      throw error;
    }
  };

  /**
   * 获取助手详情
   * @param identifier 助手标识符
   * 从 Lobe Hub 的助手市场获取助手详情
   * 实际上从 GitHub 仓库 https://github.com/lobehub/lobe-chat-agents/src/{identifier}.json 获取数据
   */
  getAssistantDetail = async (
    identifier: string,
    locale: Locales = DEFAULT_LANG,
  ): Promise<DiscoverAssistantItem> => {
    try {
      const response = await fetch(this.getAssistantUrl(identifier, locale));
      const assistant = await response.json();
      return merge(cloneDeep(DEFAULT_DISCOVER_ASSISTANT_ITEM), assistant);
    } catch (error) {
      apiLogger.error(`获取助手 ${identifier} 详情失败:`, error);
      throw error;
    }
  };
}
