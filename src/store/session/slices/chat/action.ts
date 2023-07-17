import { StateCreator } from 'zustand/vanilla';

import { fetchChatModel } from '@/services/chatModel';
import { SessionStore, agentSelectors, chatSelectors, sessionSelectors } from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';
import { FetchSSEOptions, fetchSSE } from '@/utils/fetch';
import { nanoid } from '@/utils/uuid';

import { MessageDispatch, messagesReducer } from './messageReducer';

const LOADING_FLAT = '...';

/**
 * 聊天操作
 */
export interface ChatAction {
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
  generateMessage: (messages: ChatMessage[], options: FetchSSEOptions) => Promise<void>;
  /**
   * 处理消息编辑
   * @param messageId - 消息 ID，可选
   */
  handleMessageEditing: (messageId: string | undefined) => void;
  /**
   * 实际获取 AI 响应
   *
   * @param messages - 聊天消息数组
   * @param parentId - 父消息 ID，可选
   */
  realFetchAIResponse: (messages: ChatMessage[], parentId?: string) => Promise<void>;
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

export const createChatSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ChatAction
> = (set, get) => ({
  clearMessage: () => {
    get().dispatchMessage({ type: 'resetMessages' });
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

  generateMessage: async (messages, options) => {
    set({ chatLoading: true });
    const config = agentSelectors.currentAgentConfigSafe(get());

    const fetcher = () => fetchChatModel({ messages, model: config.model, ...config.params });

    await fetchSSE(fetcher, options);

    set({ chatLoading: false });
  },

  handleMessageEditing: (messageId) => {
    set({ editingMessageId: messageId });
  },

  realFetchAIResponse: async (messages: ChatMessage[], parentId?: string) => {
    const { dispatchMessage, generateMessage } = get();

    // 添加 systemRole
    const { systemRole } = agentSelectors.currentAgentConfigSafe(get());
    if (systemRole) {
      messages.unshift({ content: systemRole, role: 'system' } as ChatMessage);
    }

    // 再添加一个空的信息用于放置 ai 响应，注意顺序不能反
    // 因为如果顺序反了，messages 中将包含新增的 ai message
    const assistantId = nanoid();
    const userId = parentId ?? nanoid();

    dispatchMessage({
      id: assistantId,
      message: LOADING_FLAT,
      parentId: userId,
      role: 'assistant',
      type: 'addMessage',
    });

    let output = '';
    // 生成 ai message
    await generateMessage(messages, {
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

        // 滚动到最后一条消息
        const item = document.querySelector('#for-loading');
        if (!item) return;

        item.scrollIntoView({ behavior: 'smooth' });
      },
    });
  },

  resendMessage: async (messageId) => {
    const session = sessionSelectors.currentSession(get());

    if (!session) return;

    // 1. 构造所有相关的历史记录
    const chats = chatSelectors.currentChats(get());

    const currentIndex = chats.findIndex((c) => c.id === messageId);

    const histories = chats
      .slice(0, currentIndex + 1)
      // 如果点击重新发送的 message 其 role 是 assistant，那么需要移除
      // 如果点击重新发送的 message 其 role 是 user，则不需要移除
      .filter((c) => !(c.role === 'assistant' && c.id === messageId));

    if (histories.length <= 0) return;

    const { realFetchAIResponse } = get();

    const latestMsg = histories.filter((s) => s.role === 'user').at(-1);

    if (!latestMsg) return;

    await realFetchAIResponse(histories, latestMsg.id);
  },

  sendMessage: async (message) => {
    const { dispatchMessage, realFetchAIResponse, autocompleteSessionAgentMeta } = get();
    const session = sessionSelectors.currentSession(get());
    if (!session || !message) return;

    const userId = nanoid();
    dispatchMessage({ id: userId, message, role: 'user', type: 'addMessage' });

    // 先拿到当前的 messages
    const messages = chatSelectors.currentChats(get());

    await realFetchAIResponse(messages);

    const chats = chatSelectors.currentChats(get());
    if (chats.length >= 4) {
      autocompleteSessionAgentMeta(session.id);
    }
  },
});
