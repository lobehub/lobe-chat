/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Note: To make the code more logic and readable, we just disable the auto sort key eslint rule
// DON'T REMOVE THE FIRST LINE
import { t } from 'i18next';
import { produce } from 'immer';
import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { chainSummaryTitle } from '@/chains/summaryTitle';
import { LOADING_FLAT } from '@/const/message';
import { TraceNameMap } from '@/const/trace';
import { SWRefreshMethod, useClientDataSWR } from '@/libs/swr';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import type { ChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';
import { ChatTopic } from '@/types/topic';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../message/selectors';
import { topicSelectors } from './selectors';

const n = setNamespace('topic');

const SWR_USE_FETCH_TOPIC = 'SWR_USE_FETCH_TOPIC';
const SWR_USE_SEARCH_TOPIC = 'SWR_USE_SEARCH_TOPIC';

export interface ChatTopicAction {
  favoriteTopic: (id: string, favState: boolean) => Promise<void>;
  openNewTopicOrSaveTopic: () => Promise<void>;
  refreshTopic: SWRefreshMethod<ChatTopic[]>;
  removeAllTopics: () => Promise<void>;
  removeSessionTopics: () => Promise<void>;
  removeTopic: (id: string) => Promise<void>;
  removeUnstarredTopic: () => void;
  saveToTopic: () => Promise<string | undefined>;
  autoRenameTopicTitle: (id: string) => Promise<void>;
  duplicateTopic: (id: string) => Promise<void>;
  summaryTopicTitle: (topicId: string, messages: ChatMessage[]) => Promise<void>;
  switchTopic: (id?: string) => Promise<void>;
  updateTopicTitleInSummary: (id: string, title: string) => void;
  updateTopicLoading: (id?: string) => void;
  updateTopicTitle: (id: string, title: string) => Promise<void>;
  useFetchTopics: (sessionId: string) => SWRResponse<ChatTopic[]>;
  useSearchTopics: (keywords?: string, sessionId?: string) => SWRResponse<ChatTopic[]>;
}

export const chatTopic: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatTopicAction
> = (set, get) => ({
  // create
  openNewTopicOrSaveTopic: async () => {
    const { switchTopic, saveToTopic, refreshMessages, activeTopicId } = get();
    const hasTopic = !!activeTopicId;

    if (hasTopic) switchTopic();
    else {
      await saveToTopic();
      refreshMessages();
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
    // TODO: 优化为乐观更新
    // const params: CreateTopicParams = {
    //   sessionId: activeId,
    //   title: t('topic.defaultTitle', { ns: 'chat' }),
    //   messages: messages.map((m) => m.id),
    // };

    // const topicId = await refreshTopic({
    //   action: async () => topicService.createTopic(params),
    //   optimisticData: (data) => topicReducer(data, { type: 'addTopic', value: params }),
    // });

    // 2. auto summary topic Title
    // we don't need to wait for summary, just let it run async
    summaryTopicTitle(topicId, messages);

    return topicId;
  },
  duplicateTopic: async (id) => {
    const { refreshTopic, switchTopic } = get();

    const topic = topicSelectors.getTopicById(id)(get());
    if (!topic) return;

    const newTitle = t('duplicateTitle', { ns: 'chat', title: topic?.title });

    const newTopicId = await topicService.cloneTopic(id, newTitle);
    await refreshTopic();

    switchTopic(newTopicId);
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
        topicService.updateTopic(topicId, { title: text });
      },
      onLoadingChange: (loading) => {
        updateTopicLoading(loading ? topicId : undefined);
      },
      onMessageHandle: (x) => {
        output += x;
        updateTopicTitleInSummary(topicId, output);
      },
      params: await chainSummaryTitle(messages),
      trace: get().getCurrentTracePayload({ traceName: TraceNameMap.SummaryTopicTitle, topicId }),
    });
    await refreshTopic();
  },
  favoriteTopic: async (id, favorite) => {
    await topicService.updateTopic(id, { favorite });
    await get().refreshTopic();
  },

  updateTopicTitle: async (id, title) => {
    await topicService.updateTopic(id, { title });
    await get().refreshTopic();
  },

  autoRenameTopicTitle: async (id) => {
    const { activeId: sessionId, summaryTopicTitle } = get();
    const messages = await messageService.getMessages(sessionId, id);

    await summaryTopicTitle(id, messages);
  },

  // query
  useFetchTopics: (sessionId) =>
    useClientDataSWR<ChatTopic[]>(
      [SWR_USE_FETCH_TOPIC, sessionId],
      async ([, sessionId]: [string, string]) => topicService.getTopics({ sessionId }),
      {
        onSuccess: (topics) => {
          set({ topics, topicsInit: true }, false, n('useFetchTopics(success)', { sessionId }));
        },
      },
    ),
  useSearchTopics: (keywords, sessionId) =>
    useSWR<ChatTopic[]>(
      [SWR_USE_SEARCH_TOPIC, keywords, sessionId],
      ([, keywords, sessionId]: [string, string, string]) =>
        topicService.searchTopics(keywords, sessionId),
      {
        onSuccess: (data) => {
          set({ searchTopics: data }, false, n('useSearchTopics(success)', { keywords }));
        },
      },
    ),
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
    const { activeId, activeTopicId, switchTopic, refreshTopic } = get();

    // remove messages in the topic
    // TODO: Need to remove because server service don't need to call it
    await messageService.removeMessages(activeId, id);

    // remove topic
    await topicService.removeTopic(id);
    await refreshTopic();

    // switch bach to default topic
    if (activeTopicId === id) switchTopic();
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
  // TODO: I don't know why this ts error, so have to ignore it
  // @ts-ignore
  refreshTopic: async (params) => {
    return mutate([SWR_USE_FETCH_TOPIC, get().activeId], params?.action, {
      optimisticData: params?.optimisticData,
      populateCache: false,
    });
  },
});
