import { crawlResultsPrompt } from '@lobechat/prompts';
import { CreateMessageParams, SEARCH_SEARXNG_NOT_CONFIG, SearchQuery } from '@lobechat/types';
import { nanoid } from '@lobechat/utils';
import { StateCreator } from 'zustand/vanilla';

import { searchService } from '@/services/search';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { WebBrowsingExecutionRuntime } from '@/tools/web-browsing/ExecutionRuntime';

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

const runtime = new WebBrowsingExecutionRuntime({ searchService });

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
      const { content, success, error, state } = await runtime.crawlMultiPages(params);

      await internal_updateMessageContent(id, content);

      if (success) {
        await get().updatePluginState(id, state);
      } else {
        await get().internal_updatePluginError(id, error);
      }
      get().toggleSearchLoading(id, false);

      // Convert to XML format to save tokens

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

  search: async (id, params, aiSummary = true) => {
    get().toggleSearchLoading(id, true);

    const { content, success, error, state } = await runtime.search(params);

    if (success) {
      await get().updatePluginState(id, state);
    } else {
      if ((error as Error).message === SEARCH_SEARXNG_NOT_CONFIG) {
        await get().internal_updateMessagePluginError(id, {
          body: {
            provider: 'searxng',
          },
          message: 'SearXNG is not configured',
          type: 'PluginSettingsInvalid',
        });
      } else {
        await get().internal_updateMessagePluginError(id, {
          body: error,
          message: (error as Error).message,
          type: 'PluginServerError',
        });
      }
    }

    get().toggleSearchLoading(id, false);

    await get().internal_updateMessageContent(id, content);

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
