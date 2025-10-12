import { crawlResultsPrompt, searchResultsPrompt } from '@lobechat/prompts';
import { StateCreator } from 'zustand/vanilla';

import { searchService } from '@/services/search';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { CRAWL_CONTENT_LIMITED_COUNT, SEARCH_ITEM_LIMITED_COUNT } from '@/tools/web-browsing/const';
import { CreateMessageParams } from '@/types/message';
import {
  SEARCH_SEARXNG_NOT_CONFIG,
  SearchContent,
  SearchQuery,
  UniformSearchResponse,
} from '@/types/tool/search';
import { nanoid } from '@/utils/uuid';

export interface SearchAction {
  crawlMultiPages: (
    id: string,
    params: { urls: string[] },
    aiSummary?: boolean,
  ) => Promise<boolean | undefined>;
  crawlSinglePage: (
    id: string,
    params: { url: string },
    aiSummary?: boolean,
  ) => Promise<boolean | undefined>;
  saveSearchResult: (id: string) => Promise<void>;
  search: (id: string, data: SearchQuery, aiSummary?: boolean) => Promise<void | boolean>;
  togglePageContent: (url: string) => void;
  toggleSearchLoading: (id: string, loading: boolean) => void;
  /**
   * 重新发起搜索
   * @description 会更新插件的 arguments 参数，然后再次搜索
   */
  triggerSearchAgain: (
    id: string,
    data: SearchQuery,
    options?: { aiSummary: boolean },
  ) => Promise<void>;
}

export const searchSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  SearchAction
> = (set, get) => ({
  crawlMultiPages: async (id, params, aiSummary = true) => {
    const { internal_updateMessageContent } = get();
    get().toggleSearchLoading(id, true);
    try {
      const response = await searchService.crawlPages(params.urls);

      await get().updatePluginState(id, response);
      get().toggleSearchLoading(id, false);
      const { results } = response;

      if (!results) return;

      const content = results.map((item) =>
        'errorMessage' in item
          ? item
          : {
              ...item.data,
              // if crawl too many content
              // slice the top 10000 char
              content: item.data.content?.slice(0, CRAWL_CONTENT_LIMITED_COUNT),
            },
      );

      // Convert to XML format to save tokens
      const xmlContent = crawlResultsPrompt(content as any);
      await internal_updateMessageContent(id, xmlContent);

      // if aiSummary is true, then trigger ai message
      return aiSummary;
    } catch (e) {
      const err = e as Error;
      console.error(e);
      const content = [{ errorMessage: err.message, errorType: err.name }];

      const xmlContent = crawlResultsPrompt(content);
      await internal_updateMessageContent(id, xmlContent);
    }
  },

  crawlSinglePage: async (id, params, aiSummary) => {
    const { crawlMultiPages } = get();

    return await crawlMultiPages(id, { urls: [params.url] }, aiSummary);
  },

  saveSearchResult: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message || !message.plugin) return;

    const { internal_addToolToAssistantMessage, internal_createMessage, openToolUI } = get();
    // 1. 创建一个新的 tool call message
    const newToolCallId = `tool_call_${nanoid()}`;

    const toolMessage: CreateMessageParams = {
      content: message.content,
      id: undefined,
      parentId: message.parentId,
      plugin: message.plugin,
      pluginState: message.pluginState,
      role: 'tool',
      sessionId: get().activeId,
      tool_call_id: newToolCallId,
      topicId: get().activeTopicId,
    };

    const addToolItem = async () => {
      if (!message.parentId || !message.plugin) return;

      await internal_addToolToAssistantMessage(message.parentId, {
        id: newToolCallId,
        ...message.plugin,
      });
    };

    const [newMessageId] = await Promise.all([
      // 1. 添加 tool message
      internal_createMessage(toolMessage),
      // 2. 将这条 tool call message 插入到 ai 消息的 tools 中
      addToolItem(),
    ]);
    if (!newMessageId) return;

    // 将新创建的 tool message 激活
    openToolUI(newMessageId, message.plugin.identifier);
  },

  search: async (id, { query, ...params }, aiSummary = true) => {
    get().toggleSearchLoading(id, true);
    let data: UniformSearchResponse | undefined;
    try {
      // 首次查询
      data = await searchService.search(query, params);

      // 如果没有搜索到结果，则执行第一次重试（移除搜索引擎限制）
      if (
        data?.results.length === 0 &&
        params?.searchEngines &&
        params?.searchEngines?.length > 0
      ) {
        const paramsExcludeSearchEngines = {
          ...params,
          searchEngines: undefined,
        };
        data = await searchService.search(query, paramsExcludeSearchEngines);
        get().updatePluginArguments(id, paramsExcludeSearchEngines);
      }

      // 如果仍然没有搜索到结果，则执行第二次重试（移除所有限制）
      if (data?.results.length === 0) {
        data = await searchService.search(query);
        get().updatePluginArguments(id, { query });
      }

      await get().updatePluginState(id, data);
    } catch (e) {
      if ((e as Error).message === SEARCH_SEARXNG_NOT_CONFIG) {
        await get().internal_updateMessagePluginError(id, {
          body: {
            provider: 'searxng',
          },
          message: 'SearXNG is not configured',
          type: 'PluginSettingsInvalid',
        });
      } else {
        await get().internal_updateMessagePluginError(id, {
          body: e,
          message: (e as Error).message,
          type: 'PluginServerError',
        });
      }
    }

    get().toggleSearchLoading(id, false);

    if (!data) return;

    // add LIMITED_COUNT search results to message content
    const searchContent: SearchContent[] = data.results
      .slice(0, SEARCH_ITEM_LIMITED_COUNT)
      .map((item) => ({
        title: item.title,
        url: item.url,
        ...(item.content && { content: item.content }),
        ...(item.publishedDate && { publishedDate: item.publishedDate }),
        ...(item.imgSrc && { imgSrc: item.imgSrc }),
        ...(item.thumbnail && { thumbnail: item.thumbnail }),
      }));

    // Convert to XML format to save tokens
    const xmlContent = searchResultsPrompt(searchContent);
    await get().internal_updateMessageContent(id, xmlContent);

    // 如果 aiSummary 为 true，则会自动触发总结
    return aiSummary;
  },
  togglePageContent: (url) => {
    set({ activePageContentUrl: url });
  },

  toggleSearchLoading: (id, loading) => {
    set(
      { searchLoading: { ...get().searchLoading, [id]: loading } },
      false,
      `toggleSearchLoading/${loading ? 'start' : 'end'}`,
    );
  },

  triggerSearchAgain: async (id, data, options) => {
    get().toggleSearchLoading(id, true);
    await get().updatePluginArguments(id, data);

    await get().search(id, data, options?.aiSummary);
  },
});
