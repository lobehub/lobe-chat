/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Note: To make the code more logic and readable, we just disable the auto sort key eslint rule
// DON'T REMOVE THE FIRST LINE
import { t } from 'i18next';
import { produce } from 'immer';
import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { chainSummaryTitle } from '@/chains/summaryTitle';
import { LOADING_FLAT } from '@/const/message';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { ChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/chatMessage';
import { ChatTopic } from '@/types/topic';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors, topicSelectors } from '../selectors';

const n = setNamespace('topic');

export interface ChatTopicAction {
  favoriteTopic: (id: string, favState: boolean) => Promise<void>;
  openNewTopicOrSaveTopic: () => Promise<void>;
  refreshTopic: () => Promise<void>;
  removeAllTopics: () => Promise<void>;
  removeSessionTopics: () => Promise<void>;
  removeTopic: (id: string) => Promise<void>;
  removeUnstarredTopic: () => void;
  saveToTopic: () => Promise<string | undefined>;
  summaryTopicTitle: (topicId: string, messages: ChatMessage[]) => Promise<void>;
  switchTopic: (id?: string) => Promise<void>;
  updateTopicTitleInSummary: (id: string, title: string) => void;
  updateTopicLoading: (id?: string) => void;
  updateTopicTitle: (id: string, title: string) => Promise<void>;
  useFetchTopics: (sessionId: string) => SWRResponse<ChatTopic[]>;
  useSearchTopics: (keywords?: string) => SWRResponse<ChatTopic[]>;
}

export const chatTopic: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatTopicAction
> = (set, get) => ({
  // create
  openNewTopicOrSaveTopic: async () => {
    const { switchTopic, saveToTopic, activeTopicId } = get();
    const hasTopic = !!activeTopicId;

    if (hasTopic) switchTopic();
    else {
      saveToTopic();
    }
  },

  saveToTopic: async () => {
    // if there is no message, stop
    const messages = chatSelectors.currentChats(get());
    if (messages.length === 0) return;

    const { activeId, summaryTopicTitle, refreshTopic } = get();

    // 1. create topic and bind these messages
    const topicId = await topicService.createTopic({
      sessionId: activeId,
      title: t('topic.defaultTitle', { ns: 'chat' }),
      messages: messages.map((m) => m.id),
    });
    await refreshTopic();

    // 2. auto summary topic Title
    // we don't need to wait for summary, just let it run async
    summaryTopicTitle(topicId, messages);

    return topicId;
  },
  // update
  summaryTopicTitle: async (topicId, messages) => {
    const { updateTopicTitleInSummary, updateTopicLoading, refreshTopic } = get();
    const topic = topicSelectors.getTopicById(topicId)(get());
    if (!topic) return;

    updateTopicTitleInSummary(topicId, LOADING_FLAT);

    let output = '';

    // 自动总结话题标题
    await chatService.fetchPresetTaskResult({
      onError: () => {
        updateTopicTitleInSummary(topicId, topic.title);
      },
      onFinish: async (text) => {
        topicService.updateTitle(topicId, text);
      },
      onLoadingChange: (loading) => {
        updateTopicLoading(loading ? topicId : undefined);
      },
      onMessageHandle: (x) => {
        output += x;
        updateTopicTitleInSummary(topicId, output);
      },
      params: await chainSummaryTitle(messages),
    });
    await refreshTopic();
  },
  favoriteTopic: async (id, favState) => {
    await topicService.updateFavorite(id, favState);
    await get().refreshTopic();
  },
  updateTopicTitle: async (id, title) => {
    await topicService.updateTitle(id, title);
    await get().refreshTopic();
  },
  // query
  useFetchTopics: (sessionId) =>
    useSWR<ChatTopic[]>(sessionId, async (sessionId) => topicService.getTopics({ sessionId }), {
      onSuccess: (topics) => {
        set({ topics, topicsInit: true }, false, n('useFetchTopics(success)', { sessionId }));
      },
      dedupingInterval: 0,
    }),
  useSearchTopics: (keywords) =>
    useSWR<ChatTopic[]>(keywords, topicService.searchTopics, {
      onSuccess: (data) => {
        set({ searchTopics: data }, false, n('useSearchTopics(success)', { keywords }));
      },
    }),
  switchTopic: async (id) => {
    set({ activeTopicId: id }, false, n('toggleTopic'));

    await get().refreshMessages();
  },
  // delete
  removeSessionTopics: async () => {
    const { switchTopic, activeId, refreshTopic } = get();

    await topicService.removeTopics(activeId);
    await refreshTopic();

    // switch to default topic
    switchTopic();
  },
  removeAllTopics: async () => {
    const { refreshTopic } = get();

    await topicService.removeAllTopic();
    await refreshTopic();
  },
  removeTopic: async (id) => {
    const { activeId, switchTopic, refreshTopic } = get();

    // remove messages in the topic
    await messageService.removeMessages(activeId, id);

    // remove topic
    await topicService.removeTopic(id);
    await refreshTopic();

    // switch bach to default topic
    switchTopic();
  },
  removeUnstarredTopic: async () => {
    const { refreshTopic, switchTopic } = get();
    const topics = topicSelectors.currentUnFavTopics(get());

    await topicService.batchRemoveTopics(topics.map((t) => t.id));
    await refreshTopic();

    // 切换到默认 topic
    switchTopic();
  },

  // Internal process method of the topics
  updateTopicTitleInSummary: (id, title) => {
    const topics = produce(get().topics, (draftState) => {
      const topic = draftState.find((i) => i.id === id);

      if (!topic) return;
      topic.title = title;
    });

    set({ topics }, false, n(`updateTopicTitleInSummary`, { id, title }));
  },
  updateTopicLoading: (id) => {
    set({ topicLoadingId: id }, false, n('updateTopicLoading'));
  },
  refreshTopic: async () => {
    await mutate(get().activeId);
  },
});
