import { StateCreator } from 'zustand/vanilla';

import { fetchChatModel } from '@/services/chatModel';
import { ChatMessage } from '@/types/chatMessage';
import { FetchSSEOptions, fetchSSE } from '@/utils/fetch';

import { SessionStore, sessionSelectors } from '@/store/session';
import { nanoid } from '@/utils/uuid';
import { MessageDispatch, messagesReducer } from './messageReducer';

const LOADING_FLAT = '...';

export interface ChatAction {
  /**
   * @title 发送消息
   * @returns Promise<void>
   */
  sendMessage: (text: string) => Promise<void>;
  /**
   * @title 重发消息
   * @param index - 消息索引
   * @returns Promise<void>
   */
  resendMessage: (index: number) => Promise<void>;

  generateMessage: (messages: ChatMessage[], options: FetchSSEOptions) => Promise<void>;

  /**
   * @title 派发消息
   * @param payload - 消息分发
   * @returns void
   */
  dispatchMessage: (payload: MessageDispatch) => void;
  /**
   * @title 处理消息编辑
   * @param index - 消息索引或空
   * @returns void
   */
  handleMessageEditing: (messageId: string | undefined) => void;
}

export const createChatSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ChatAction
> = (set, get) => ({
  dispatchMessage: (payload) => {
    const { activeId } = get();
    const session = sessionSelectors.currentChat(get());
    if (!activeId || !session) return;

    const chats = messagesReducer(session.chats, payload);

    get().dispatchSession({ type: 'updateSessionChat', chats, id: activeId });
  },

  handleMessageEditing: (messageId) => {
    set({ editingMessageId: messageId });
  },

  generateMessage: async (messages, options) => {
    set({ chatLoading: true });

    const fetcher = () => fetchChatModel({ messages });

    await fetchSSE(fetcher, options);

    set({ chatLoading: false });
  },

  sendMessage: async (message) => {
    const { dispatchMessage, generateMessage } = get();
    const session = sessionSelectors.currentChat(get());
    if (!session || !message) return;

    const messages = session.chats;

    const aiMessageId = nanoid();
    dispatchMessage({ type: 'addMessage', role: 'user', message });
    dispatchMessage({
      type: 'addMessage',
      role: 'assistant',
      message: LOADING_FLAT,
      id: aiMessageId,
    });

    // 添加一个空的信息用于放置 ai 响应

    let output = '';

    // 生成 messages
    await generateMessage(messages, {
      onMessageHandle: (text) => {
        output += text;

        dispatchMessage({ type: 'updateMessage', id: aiMessageId, key: 'content', value: output });

        // 滚动到最后一条消息
        const item = document.getElementById('for-loading');
        if (!item) return;

        item.scrollIntoView({ behavior: 'smooth' });
      },
      onErrorHandle: (error) => {
        dispatchMessage({ type: 'updateMessage', id: aiMessageId, key: 'content', value: error });
      },
    });
  },

  resendMessage: async (index) => {
    const { dispatchMessage, sendMessage, generateMessage, messages } = get();
    const lastMessage = messages.at(-1);
    // 用户通过手动删除，造成了他的问题是最后一条消息
    // 这种情况下，相当于用户重新发送消息
    if (messages.length === index && lastMessage?.role === 'user') {
      dispatchMessage({ type: 'deleteMessage', index: index - 1 });
      set({ message: lastMessage.content });
      await sendMessage();
      return;
    }

    // 上下文消息就是当前消息之前的消息
    const contextMessages = get().messages.slice(0, index);

    // 上下文消息中最后一条消息
    const userMessage = contextMessages.at(-1)?.content;
    if (!userMessage) return;

    const targetMsg = messages[index];

    // 如果不是 assistant 的消息，那么需要额外插入一条消息
    if (targetMsg.role !== 'assistant') {
      dispatchMessage({
        type: 'insertMessage',
        index,
        message: { role: 'assistant', content: LOADING_FLAT },
      });
    } else {
      const botPrevMsg = targetMsg.content;
      // 保存之前的消息为历史消息
      dispatchMessage({ type: 'updateMessageChoice', message: botPrevMsg, index });
      dispatchMessage({ type: 'updateMessage', message: LOADING_FLAT, index });
    }

    // 重置错误信息
    dispatchMessage({ type: 'setErrorMessage', error: undefined, index });

    // 开始更新消息
    let currentResponse: string[] = [];

    await generateMessage(userMessage, contextMessages, {
      onMessageHandle: (text) => {
        currentResponse = [...currentResponse, text];
        dispatchMessage({ type: 'updateMessage', message: currentResponse.join(''), index });
      },
      onErrorHandle: (error) => {
        dispatchMessage({ type: 'setErrorMessage', error, index });
      },
    });
  },
});
