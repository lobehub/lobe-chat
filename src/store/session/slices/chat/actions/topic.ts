import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT } from '@/const/message';
import { promptSummaryTitle } from '@/prompts/chat';
import { SessionStore } from '@/store/session';
import { fetchPresetTaskResult } from '@/utils/fetch';
import { setNamespace } from '@/utils/storeDebug';
import { nanoid } from '@/utils/uuid';

import { sessionSelectors } from '../../session/selectors';
import { ChatTopicDispatch, topicReducer } from '../reducers/topic';
import { chatSelectors, topicSelectors } from '../selectors';

const t = setNamespace('chat/topic');
export interface ChatTopicAction {
  /**
   * 分发主题
   * @param payload - 要分发的主题
   */
  dispatchTopic: (payload: ChatTopicDispatch) => void;
  /**
   * 移除话题
   * @param id
   */
  removeTopic: (id: string) => void;
  /**
   * 将当前消息保存为主题
   */
  saveToTopic: () => void;
  /**
   * 切换主题
   * @param id - 要切换的主题的 ID
   */
  toggleTopic: (id?: string) => void;
  /**
   * 更新主题加载状态
   * @param id - 要更新的主题的 ID
   */
  updateTopicLoading: (id?: string) => void;
}

export const chatTopic: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ChatTopicAction
> = (set, get) => ({
  dispatchTopic: (payload) => {
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    const topics = topicReducer(session.topics || {}, payload);

    get().dispatchSession({ id: activeId, topics, type: 'updateSessionTopic' });
  },
  removeTopic: (id) => {
    const { dispatchTopic, dispatchMessage, toggleTopic } = get();

    // 移除关联的 message
    const messages = topicSelectors.getTopicMessages(id)(get());
    for (const m of messages) {
      dispatchMessage({
        id: m.id,
        type: 'deleteMessage',
      });
    }

    // 最后移除 topic
    dispatchTopic({ id, type: 'deleteChatTopic' });

    // 切换到默认 topic
    toggleTopic();
  },
  saveToTopic: () => {
    const session = sessionSelectors.currentSession(get());
    if (!session) return;

    const { dispatchTopic, dispatchMessage, updateTopicLoading } = get();
    // 获取当前的 messages
    const messages = chatSelectors.currentChats(get());

    const topicId = nanoid();

    const defaultTitle = '默认话题';
    const newTopic = {
      createAt: Date.now(),
      id: topicId,
      title: defaultTitle,
      updateAt: Date.now(),
    };

    dispatchTopic({
      topic: newTopic,
      type: 'addChatTopic',
    });

    // 为所有 message 添加 topicId
    for (const m of messages) {
      dispatchMessage({ id: m.id, key: 'topicId', type: 'updateMessage', value: topicId });
    }

    dispatchTopic({ id: topicId, key: 'title', type: 'updateChatTopic', value: LOADING_FLAT });

    let output = '';

    // 自动总结话题标题
    fetchPresetTaskResult({
      onError: () => {
        dispatchTopic({ id: topicId, key: 'title', type: 'updateChatTopic', value: defaultTitle });
      },
      onLoadingChange: (loading) => {
        updateTopicLoading(loading ? topicId : undefined);
      },
      onMessageHandle: (x) => {
        output += x;
        dispatchTopic({ id: topicId, key: 'title', type: 'updateChatTopic', value: output });
      },
      params: promptSummaryTitle(messages),
    });
  },
  toggleTopic: (id) => {
    set({ activeTopicId: id }, false, t('toggleTopic'));
  },
  updateTopicLoading: (id) => {
    set({ topicLoadingId: id }, false, t('updateTopicLoading'));
  },
});
