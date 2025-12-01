/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { LOADING_FLAT } from '@lobechat/const';
import { chainSummaryTitle } from '@lobechat/prompts';
import {
  CreateMessageParams,
  IThreadType,
  SendThreadMessageParams,
  ThreadItem,
  UIChatMessage,
} from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { chatService } from '@/services/chat';
import { threadService } from '@/services/thread';
import { threadSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { globalHelpers } from '@/store/global/helpers';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/selectors';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { ThreadDispatch, threadReducer } from './reducer';

const n = setNamespace('thd');
const SWR_USE_FETCH_THREADS = 'SWR_USE_FETCH_THREADS';

export interface ChatThreadAction {
  // update
  updateThreadInputMessage: (message: string) => void;
  refreshThreads: () => Promise<void>;
  /**
   * Sends a new thread message to the AI chat system
   * @deprecated Use sendMessage with context.newThread instead for unified message sending.
   * This method will be removed in a future version.
   */
  sendThreadMessage: (params: SendThreadMessageParams) => Promise<void>;
  resendThreadMessage: (messageId: string) => Promise<void>;
  delAndResendThreadMessage: (messageId: string) => Promise<void>;
  createThread: (params: {
    message: CreateMessageParams;
    sourceMessageId: string;
    topicId: string;
    type: IThreadType;
  }) => Promise<{ threadId: string; messageId: string }>;
  openThreadCreator: (messageId: string) => void;
  openThreadInPortal: (threadId: string, sourceMessageId?: string | null) => void;
  closeThreadPortal: () => void;
  useFetchThreads: (enable: boolean, topicId?: string) => SWRResponse<ThreadItem[]>;
  summaryThreadTitle: (threadId: string, messages: UIChatMessage[]) => Promise<void>;
  updateThreadTitle: (id: string, title: string) => Promise<void>;
  removeThread: (id: string) => Promise<void>;
  switchThread: (id: string) => void;

  internal_updateThreadTitleInSummary: (id: string, title: string) => void;
  internal_updateThreadLoading: (id: string, loading: boolean) => void;
  internal_updateThread: (id: string, data: Partial<ThreadItem>) => Promise<void>;
  internal_dispatchThread: (payload: ThreadDispatch, action?: any) => void;
}

export const chatThreadMessage: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatThreadAction
> = (set, get) => ({
  updateThreadInputMessage: (message) => {
    if (isEqual(message, get().threadInputMessage)) return;

    set({ threadInputMessage: message }, false, n(`updateThreadInputMessage`, message));
  },

  openThreadCreator: (messageId) => {
    set(
      { threadStartMessageId: messageId, portalThreadId: undefined, startToForkThread: true },
      false,
      'openThreadCreator',
    );
    get().togglePortal(true);
  },
  openThreadInPortal: (threadId, sourceMessageId) => {
    set(
      { portalThreadId: threadId, threadStartMessageId: sourceMessageId, startToForkThread: false },
      false,
      'openThreadInPortal',
    );
    get().togglePortal(true);
  },

  closeThreadPortal: () => {
    set(
      { threadStartMessageId: undefined, portalThreadId: undefined, startToForkThread: undefined },
      false,
      'closeThreadPortal',
    );
    get().togglePortal(false);
  },
  /**
   * @deprecated Use sendMessage with context.newThread instead
   */
  sendThreadMessage: async ({ message }) => {
    const { activeTopicId, activeAgentId, threadStartMessageId, newThreadMode, portalThreadId } =
      get();

    if (!activeAgentId || !activeTopicId) return;

    // if message is empty, then stop
    if (!message) return;

    set({ isCreatingThreadMessage: true }, false, n('creatingThreadMessage/start'));

    try {
      // Get thread messages for context
      const messages = threadSelectors.portalAIChats(get());

      // Use unified sendMessage with context.newThread for new thread creation
      const result = await get().sendMessage({
        message,
        messages,
        context: {
          agentId: activeAgentId,
          topicId: activeTopicId,
          // If there's an existing thread, use it
          threadId: portalThreadId,
          // If no thread exists, create a new one
          newThread:
            !portalThreadId && threadStartMessageId
              ? {
                  sourceMessageId: threadStartMessageId,
                  type: newThreadMode,
                }
              : undefined,
        },
      });

      // Handle post-message-creation tasks for new thread
      if (result?.createdThreadId) {
        // Refresh threads list
        await get().refreshThreads();
        // Refresh messages to include new thread messages
        await get().refreshMessages();
        // Open the newly created thread in portal
        get().openThreadInPortal(result.createdThreadId, threadStartMessageId);

        // Summarize thread title for new thread
        const portalThread = threadSelectors.currentPortalThread(get());
        if (portalThread) {
          const chats = threadSelectors.portalAIChats(get());
          await get().summaryThreadTitle(portalThread.id, chats);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isCreatingThreadMessage: false }, false, n('creatingThreadMessage/stop'));
    }
  },
  resendThreadMessage: async (messageId) => {
    // const chats = threadSelectors.portalAIChats(get());

    await get().regenerateUserMessage(messageId, {
      // messages: chats,
      // threadId: get().portalThreadId,
      // inPortalThread: true,
    });
  },
  delAndResendThreadMessage: async (id) => {
    get().resendThreadMessage(id);
    get().deleteMessage(id);
  },
  createThread: async ({ message, sourceMessageId, topicId, type }) => {
    set({ isCreatingThread: true }, false, n('creatingThread/start'));

    const data = await threadService.createThreadWithMessage({
      topicId,
      sourceMessageId,
      type,
      message,
    });
    set({ isCreatingThread: false }, false, n('creatingThread/end'));

    return data;
  },

  useFetchThreads: (enable, topicId) =>
    useClientDataSWR<ThreadItem[]>(
      enable && !!topicId ? [SWR_USE_FETCH_THREADS, topicId] : null,
      async ([, topicId]: [string, string]) => threadService.getThreads(topicId),
      {
        onSuccess: (threads) => {
          const nextMap = { ...get().threadMaps, [topicId!]: threads };

          // no need to update map if the topics have been init and the map is the same
          if (get().topicsInit && isEqual(nextMap, get().topicMaps)) return;

          set(
            { threadMaps: nextMap, threadsInit: true },
            false,
            n('useFetchThreads(success)', { topicId }),
          );
        },
      },
    ),

  refreshThreads: async () => {
    const topicId = get().activeTopicId;
    if (!topicId) return;

    return mutate([SWR_USE_FETCH_THREADS, topicId]);
  },
  removeThread: async (id) => {
    await threadService.removeThread(id);
    await get().refreshThreads();

    if (get().activeThreadId === id) {
      set({ activeThreadId: undefined });
    }
  },
  switchThread: async (id) => {
    set({ activeThreadId: id }, false, n('toggleTopic'));
  },
  updateThreadTitle: async (id, title) => {
    await get().internal_updateThread(id, { title });
  },

  summaryThreadTitle: async (threadId, messages) => {
    const { internal_updateThreadTitleInSummary, internal_updateThreadLoading } = get();
    const portalThread = threadSelectors.currentPortalThread(get());
    if (!portalThread) return;

    internal_updateThreadTitleInSummary(threadId, LOADING_FLAT);

    let output = '';
    const threadConfig = systemAgentSelectors.thread(useUserStore.getState());

    await chatService.fetchPresetTaskResult({
      onError: () => {
        internal_updateThreadTitleInSummary(threadId, portalThread.title);
      },
      onFinish: async (text) => {
        await get().internal_updateThread(threadId, { title: text });
      },
      onLoadingChange: (loading) => {
        internal_updateThreadLoading(threadId, loading);
      },
      onMessageHandle: (chunk) => {
        switch (chunk.type) {
          case 'text': {
            output += chunk.text;
          }
        }

        internal_updateThreadTitleInSummary(threadId, output);
      },
      params: merge(threadConfig, chainSummaryTitle(messages, globalHelpers.getCurrentLanguage())),
    });
  },

  // Internal process method of the topics
  internal_updateThreadTitleInSummary: (id, title) => {
    get().internal_dispatchThread(
      { type: 'updateThread', id, value: { title } },
      'updateThreadTitleInSummary',
    );
  },

  internal_updateThreadLoading: (id, loading) => {
    set(
      (state) => {
        if (loading) return { threadLoadingIds: [...state.threadLoadingIds, id] };

        return { threadLoadingIds: state.threadLoadingIds.filter((i) => i !== id) };
      },
      false,
      n('updateThreadLoading'),
    );
  },

  internal_updateThread: async (id, data) => {
    get().internal_dispatchThread({ type: 'updateThread', id, value: data });

    get().internal_updateThreadLoading(id, true);
    await threadService.updateThread(id, data);
    await get().refreshThreads();
    get().internal_updateThreadLoading(id, false);
  },

  internal_dispatchThread: (payload, action) => {
    const nextThreads = threadReducer(threadSelectors.currentTopicThreads(get()), payload);
    const nextMap = { ...get().threadMaps, [get().activeTopicId!]: nextThreads };

    // no need to update map if is the same
    if (isEqual(nextMap, get().threadMaps)) return;

    set({ threadMaps: nextMap }, false, action ?? n(`dispatchThread/${payload.type}`));
  },
});
