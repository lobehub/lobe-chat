import { crawlResultsPrompt } from '@lobechat/prompts';
import { CreateMessageParams, SEARCH_SEARXNG_NOT_CONFIG, SearchQuery } from '@lobechat/types';
import { nanoid } from '@lobechat/utils';
import debug from 'debug';
import { StateCreator } from 'zustand/vanilla';

import { searchService } from '@/services/search';
import { dbMessageSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { WebBrowsingExecutionRuntime } from '@/tools/web-browsing/ExecutionRuntime';

const log = debug('lobe-store:builtin-tool');

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
    // Get parent operationId from messageOperationMap (should be executeToolCall)
    const parentOperationId = get().messageOperationMap[id];

    // Create child operation for crawl execution
    // Auto-associates message with this operation via messageId in context
    const { operationId: crawlOpId, abortController } = get().startOperation({
      context: {
        messageId: id,
      },
      metadata: {
        startTime: Date.now(),
        urls: params.urls,
      },
      parentOperationId,
      type: 'builtinToolSearch',
    });

    log(
      '[crawlMultiPages] messageId=%s, parentOpId=%s, crawlOpId=%s, urls=%o, aborted=%s',
      id,
      parentOperationId,
      crawlOpId,
      params.urls,
      abortController.signal.aborted,
    );

    const context = { operationId: crawlOpId };

    try {
      const { content, success, error, state } = await runtime.crawlMultiPages(params);

      // Complete crawl operation
      get().completeOperation(crawlOpId);

      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(id, error, context);
      }

      // if aiSummary is true, then trigger ai message
      return aiSummary;
    } catch (e) {
      const err = e as Error;

      log('[crawlMultiPages] Error: messageId=%s, error=%s', id, err.message);

      // Check if it's an abort error
      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        log('[crawlMultiPages] Request aborted: messageId=%s', id);
        // Fail crawl operation for abort
        get().failOperation(crawlOpId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        // Don't update error message for user aborts
        return;
      }

      // Fail crawl operation for other errors
      get().failOperation(crawlOpId, {
        message: err.message,
        type: 'PluginServerError',
      });

      // For other errors, update message
      console.error(e);
      const content = [{ errorMessage: err.message, errorType: err.name }];

      const xmlContent = crawlResultsPrompt(content);
      await get().optimisticUpdateMessageContent(id, xmlContent, undefined, context);
    }
  },

  crawlSinglePage: async (id, params, aiSummary) => {
    const { crawlMultiPages } = get();

    return await crawlMultiPages(id, { urls: [params.url] }, aiSummary);
  },

  saveSearchResult: async (id) => {
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message || !message.plugin) return;

    const { optimisticAddToolToAssistantMessage, optimisticCreateMessage, openToolUI } = get();

    // Get operationId from messageOperationMap
    const operationId = get().messageOperationMap[id];
    const context = operationId ? { operationId } : undefined;

    // 1. 创建一个新的 tool call message
    const newToolCallId = `tool_call_${nanoid()}`;

    const toolMessage: CreateMessageParams = {
      content: message.content,
      id: undefined,
      parentId: message.parentId,
      plugin: message.plugin,
      pluginState: message.pluginState,
      role: 'tool',
      sessionId: message.sessionId ?? get().activeId,
      tool_call_id: newToolCallId,
      topicId: message.topicId !== undefined ? message.topicId : get().activeTopicId,
    };

    const addToolItem = async () => {
      if (!message.parentId || !message.plugin) return;

      await optimisticAddToolToAssistantMessage(
        message.parentId,
        {
          id: newToolCallId,
          ...message.plugin,
        },
        context,
      );
    };

    const [result] = await Promise.all([
      // 1. 添加 tool message
      optimisticCreateMessage(toolMessage, context),
      // 2. 将这条 tool call message 插入到 ai 消息的 tools 中
      addToolItem(),
    ]);
    if (!result) return;

    // 将新创建的 tool message 激活
    openToolUI(result.id, message.plugin.identifier);
  },

  search: async (id, params, aiSummary = true) => {
    // Get parent operationId from messageOperationMap (should be executeToolCall)
    const parentOperationId = get().messageOperationMap[id];

    // Create child operation for search execution
    // Auto-associates message with this operation via messageId in context
    const { operationId: searchOpId, abortController } = get().startOperation({
      context: {
        messageId: id,
      },
      metadata: {
        query: params.query,
        startTime: Date.now(),
      },
      parentOperationId,
      type: 'builtinToolSearch',
    });

    log(
      '[search] messageId=%s, parentOpId=%s, searchOpId=%s, aborted=%s',
      id,
      parentOperationId,
      searchOpId,
      abortController.signal.aborted,
    );

    const context = { operationId: searchOpId };

    try {
      const { content, success, error, state } = await runtime.search(params, {
        signal: abortController.signal,
      });

      // Complete search operation
      get().completeOperation(searchOpId);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        if ((error as Error).message === SEARCH_SEARXNG_NOT_CONFIG) {
          await get().optimisticUpdateMessagePluginError(
            id,
            {
              body: { provider: 'searxng' },
              message: 'SearXNG is not configured',
              type: 'PluginSettingsInvalid',
            },
            context,
          );
        } else {
          await get().optimisticUpdateMessagePluginError(
            id,
            {
              body: error,
              message: (error as Error).message,
              type: 'PluginServerError',
            },
            context,
          );
        }
      }

      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      // 如果 aiSummary 为 true，则会自动触发总结
      return aiSummary;
    } catch (error) {
      const err = error as Error;

      log('[search] Error: messageId=%s, error=%s', id, err.message);

      // Check if it's an abort error
      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        log('[search] Request aborted: messageId=%s', id);
        // Fail search operation for abort
        get().failOperation(searchOpId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        // Don't update error message for user aborts
        return;
      }

      // Fail search operation for other errors
      get().failOperation(searchOpId, { message: err.message, type: 'PluginServerError' });

      // For other errors, update message
      await get().optimisticUpdateMessagePluginError(
        id,
        { body: error, message: err.message, type: 'PluginServerError' },
        context,
      );
    }
  },
  togglePageContent: (url) => {
    set({ activePageContentUrl: url });
  },

  triggerSearchAgain: async (id, data, options) => {
    // Get operationId from messageOperationMap to ensure proper context isolation
    const operationId = get().messageOperationMap[id];
    const context = operationId ? { operationId } : undefined;

    await get().optimisticUpdatePluginArguments(id, data, false, context);

    await get().search(id, data, options?.aiSummary);
  },
});
