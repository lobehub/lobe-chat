import { StateCreator } from 'zustand/vanilla';

import { promptSummaryTitle } from '@/prompts/chat';
import { SessionStore, chatSelectors, sessionSelectors } from '@/store/session';
import { fetchPresetTaskResult } from '@/utils/fetch';
import { nanoid } from '@/utils/uuid';

import { ChatTopicDispatch, topicReducer } from '../reducers/topic';

export interface ChatTopicAction {
  /**
   * 分发主题
   * @param payload - 要分发的主题
   */
  dispatchTopic: (payload: ChatTopicDispatch) => void;
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
    set({ activeTopicId: id });
  },

  updateTopicLoading: (id) => {
    set({ topicLoadingId: id });
  },
});
