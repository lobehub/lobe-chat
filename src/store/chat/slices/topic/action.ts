/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Note: To make the code more logic and readable, we just disable the auto sort key eslint rule
// DON'T REMOVE THE FIRST LINE
import { t } from 'i18next';
import { produce } from 'immer';
import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { chainSummaryTitle } from '@/chains/summaryTitle';
import { message } from '@/components/AntdStaticMethods';
import { LOADING_FLAT } from '@/const/message';
import { TraceNameMap } from '@/const/trace';
import { useClientDataSWR } from '@/libs/swr';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { CreateTopicParams } from '@/services/topic/type';
import type { ChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';
import { ChatTopic } from '@/types/topic';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../message/selectors';
import { ChatTopicDispatch, topicReducer } from './reducer';
import { topicSelectors } from './selectors';

const n = setNamespace('topic');

const SWR_USE_FETCH_TOPIC = 'SWR_USE_FETCH_TOPIC';
const SWR_USE_SEARCH_TOPIC = 'SWR_USE_SEARCH_TOPIC';

export interface ChatTopicAction {
  favoriteTopic: (id: string, favState: boolean) => Promise<void>;
  openNewTopicOrSaveTopic: () => Promise<void>;
  refreshTopic: () => Promise<void>;
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
  updateTopicTitle: (id: string, title: string) => Promise<void>;
  useFetchTopics: (sessionId: string) => SWRResponse<ChatTopic[]>;
  useSearchTopics: (keywords?: string, sessionId?: string) => SWRResponse<ChatTopic[]>;

  internal_updateTopicLoading: (id: string, loading: boolean) => void;
  internal_createTopic: (params: CreateTopicParams) => Promise<string>;
  internal_updateTopic: (id: string, data: Partial<ChatTopic>) => Promise<void>;
  internal_dispatchTopic: (payload: ChatTopicDispatch, action?: any) => void;
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

    const { activeId, summaryTopicTitle, internal_createTopic } = get();

    // 1. create topic and bind these messages
    const topicId = await internal_createTopic({
      sessionId: activeId,
      title: t('topic.defaultTitle', { ns: 'chat' }),
      messages: messages.map((m) => m.id),
    });

    get().internal_updateTopicLoading(topicId, true);
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

    message.loading({
      content: t('topic.duplicateLoading', { ns: 'chat' }),
      key: 'duplicateTopic',
      duration: 0,
    });

    const newTopicId = await topicService.cloneTopic(id, newTitle);
    await refreshTopic();
    message.destroy('duplicateTopic');
    message.success(t('topic.duplicateSuccess', { ns: 'chat' }));

    await switchTopic(newTopicId);
  },
  // update
  summaryTopicTitle: async (topicId, messages) => {
    const { updateTopicTitleInSummary, internal_updateTopicLoading } = get();
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
        await get().internal_updateTopic(topicId, { title: text });
      },
      onLoadingChange: (loading) => {
        internal_updateTopicLoading(topicId, loading);
      },
      onMessageHandle: (chunk) => {
        switch (chunk.type) {
          case 'text': {
            output += chunk.text;
          }
        }

        updateTopicTitleInSummary(topicId, output);
      },
      params: await chainSummaryTitle(messages),
      trace: get().getCurrentTracePayload({ traceName: TraceNameMap.SummaryTopicTitle, topicId }),
    });
  },
  favoriteTopic: async (id, favorite) => {
    await get().internal_updateTopic(id, { favorite });
  },

  updateTopicTitle: async (id, title) => {
    await get().internal_updateTopic(id, { title });
  },

  autoRenameTopicTitle: async (id) => {
    const { activeId: sessionId, summaryTopicTitle, internal_updateTopicLoading } = get();

    internal_updateTopicLoading(id, true);
    const messages = await messageService.getMessages(sessionId, id);

    await summaryTopicTitle(id, messages);
    internal_updateTopicLoading(id, false);
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
  refreshTopic: async () => {
    return mutate([SWR_USE_FETCH_TOPIC, get().activeId]);
  },

  internal_updateTopicLoading: (id, loading) => {
    set(
      (state) => {
        if (loading) return { topicLoadingIds: [...state.topicLoadingIds, id] };

        return { topicLoadingIds: state.topicLoadingIds.filter((i) => i !== id) };
      },
      false,
      n('updateTopicLoading'),
    );
  },

  internal_updateTopic: async (id, data) => {
    get().internal_dispatchTopic({ type: 'updateTopic', id, value: data });

    get().internal_updateTopicLoading(id, true);
    await topicService.updateTopic(id, data);
    await get().refreshTopic();
    get().internal_updateTopicLoading(id, false);
  },
  internal_createTopic: async (params) => {
    const tmpId = Date.now().toString();
    get().internal_dispatchTopic({ type: 'addTopic', value: { ...params, id: tmpId } });

    get().internal_updateTopicLoading(tmpId, true);
    const topicId = await topicService.createTopic(params);
    get().internal_updateTopicLoading(tmpId, false);

    get().internal_updateTopicLoading(topicId, true);
    await get().refreshTopic();
    get().internal_updateTopicLoading(topicId, false);

    return topicId;
  },

  internal_dispatchTopic: (payload, action) => {
    const nextTopics = topicReducer(get().topics, payload);

    set({ topics: nextTopics }, false, action);
  },
});
