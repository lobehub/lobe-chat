import { StateCreator } from 'zustand/vanilla';

import { fetchChatModel } from '@/services/chatModel';
import { SessionStore, agentSelectors, chatSelectors, sessionSelectors } from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';
import { fetchSSE } from '@/utils/fetch';
import { isFunctionMessage } from '@/utils/message';
import { nanoid } from '@/utils/uuid';

import { MessageDispatch, messagesReducer } from '../reducers/message';

const LOADING_FLAT = '...';

/**
 * 聊天操作
 */
export interface ChatMessageAction {
  /**
   * 清除消息
   */
  clearMessage: () => void;
  /**
   * 创建或发送消息
   * @param text - 消息文本
   */
  createOrSendMsg: (text: string) => Promise<void>;
  /**
   * 删除消息
   * @param id - 消息 ID
   */
  deleteMessage: (id: string) => void;
  /**
   * 分发消息
   * @param payload - 消息分发参数
   */
  dispatchMessage: (payload: MessageDispatch) => void;
  /**
   * 生成消息
   * @param messages - 聊天消息数组
   * @param options - 获取 SSE 选项
   */
  generateMessage: (
    messages: ChatMessage[],
    assistantMessageId: string,
    withPlugin?: boolean,
  ) => Promise<{ isFunctionCall: boolean; output: string }>;

  /**
   * 实际获取 AI 响应
   *
   * @param messages - 聊天消息数组
   * @param parentId - 父消息 ID，可选
   */
  realFetchAIResponse: (messages: ChatMessage[], parentId: string) => Promise<void>;
  /**
   * 重新发送消息
   * @param id - 消息 ID
   */
  resendMessage: (id: string) => Promise<void>;

  /**
   * 发送消息
   * @param text - 消息文本
   */
  sendMessage: (text: string) => Promise<void>;
}

export const chatMessage: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (set, get) => ({
  clearMessage: () => {
    const { dispatchMessage, activeTopicId, dispatchTopic } = get();

    dispatchMessage({ topicId: activeTopicId, type: 'resetMessages' });

    if (activeTopicId) {
      dispatchTopic({ id: activeTopicId, type: 'deleteChatTopic' });
    }
  },

  createOrSendMsg: async (message) => {
    if (!message) return;

    const { sendMessage, createSession } = get();
    const session = sessionSelectors.currentSession(get());

    if (!session) {
      await createSession();
    }

    sendMessage(message);
  },

  deleteMessage: (id) => {
    get().dispatchMessage({ id, type: 'deleteMessage' });
  },

  dispatchMessage: (payload) => {
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    const chats = messagesReducer(session.chats, payload);

    get().dispatchSession({ chats, id: activeId, type: 'updateSessionChat' });
  },

  generateMessage: async (messages, assistantId, withPlugin) => {
    const { dispatchMessage } = get();
    set({ chatLoading: true });
    const config = agentSelectors.currentAgentConfigSafe(get());

    const fetcher = () =>
      fetchChatModel(
        { messages, model: config.model, ...config.params, plugins: config.plugins },
        { withPlugin },
      );

    let output = '';
    let isFunctionCall = false;

    await fetchSSE(fetcher, {
      onErrorHandle: (error) => {
        dispatchMessage({ id: assistantId, key: 'error', type: 'updateMessage', value: error });
      },
      onMessageHandle: (text) => {
        output += text;

        dispatchMessage({
          id: assistantId,
          key: 'content',
          type: 'updateMessage',
          value: output,
        });

        // 如果是 function call
        if (isFunctionMessage(output)) {
          isFunctionCall = true;
          // 设为 function
          dispatchMessage({
            id: assistantId,
            key: 'role',
            type: 'updateMessage',
            value: 'function',
          });
        }

        // 滚动到最后一条消息
        const item = document.querySelector('#for-loading');
        if (!item) return;

        item.scrollIntoView({ behavior: 'smooth' });
      },
    });

    set({ chatLoading: false });

    return { isFunctionCall, output };
  },

  realFetchAIResponse: async (messages, userMessageId) => {
    const { dispatchMessage, generateMessage, activeTopicId } = get();

    // 添加 systemRole
    const { systemRole, model } = agentSelectors.currentAgentConfigSafe(get());
    if (systemRole) {
      messages.unshift({ content: systemRole, role: 'system' } as ChatMessage);
    }

    // 再添加一个空的信息用于放置 ai 响应，注意顺序不能反
    // 因为如果顺序反了，messages 中将包含新增的 ai message
    const mid = nanoid();

    dispatchMessage({
      id: mid,
      message: LOADING_FLAT,
      parentId: userMessageId,
      role: 'assistant',
      type: 'addMessage',
    });

    // 如果有 activeTopicId，则添加 topicId
    if (activeTopicId) {
      dispatchMessage({ id: mid, key: 'topicId', type: 'updateMessage', value: activeTopicId });
    }

    // 为模型添加 fromModel 的额外信息
    dispatchMessage({ id: mid, key: 'fromModel', type: 'updateMessageExtra', value: model });

    // 生成 ai message
    const { output, isFunctionCall } = await generateMessage(messages, mid);

    // 如果是 function，则发送函数调用方法
    if (isFunctionCall) {
      const { function_call } = JSON.parse(output);

      dispatchMessage({
        id: mid,
        key: 'function_call',
        type: 'updateMessage',
        value: function_call,
      });

      await generateMessage(
        [...messages, { content: '', function_call, id: mid, role: 'assistant' } as ChatMessage],
        mid,
        true,
      );

      dispatchMessage({
        id: mid,
        key: 'role',
        type: 'updateMessage',
        value: 'assistant',
      });
    }
  },

  resendMessage: async (messageId) => {
    const session = sessionSelectors.currentSession(get());

    if (!session) return;

    // 1. 构造所有相关的历史记录
    const chats = chatSelectors.currentChats(get());

    const currentIndex = chats.findIndex((c) => c.id === messageId);

    const histories = chats
      .slice(0, currentIndex + 1)
      // 如果点击重新发送的 message 其 role 是 assistant 或者 function，那么需要移除
      // 如果点击重新发送的 message 其 role 是 user，则不需要移除
      .filter((c) => !(c.role === 'assistant' && c.id === messageId));

    if (histories.length <= 0) return;

    const { realFetchAIResponse } = get();

    const latestMsg = histories.filter((s) => s.role === 'user').at(-1);

    if (!latestMsg) return;

    await realFetchAIResponse(histories, latestMsg.id);
  },

  sendMessage: async (message) => {
    const { dispatchMessage, realFetchAIResponse, autocompleteSessionAgentMeta, activeTopicId } =
      get();
    const session = sessionSelectors.currentSession(get());
    if (!session || !message) return;

    const userId = nanoid();
    dispatchMessage({ id: userId, message, role: 'user', type: 'addMessage' });

    // 如果有 activeTopicId，则添加 topicId
    if (activeTopicId) {
      dispatchMessage({ id: userId, key: 'topicId', type: 'updateMessage', value: activeTopicId });
    }

    // 先拿到当前的 messages
    const messages = chatSelectors.currentChats(get());

    await realFetchAIResponse(messages, userId);

    const chats = chatSelectors.currentChats(get());
    if (chats.length >= 4) {
      autocompleteSessionAgentMeta(session.id);
    }
  },
});
