import { StateCreator } from 'zustand/vanilla';

import { fetchChatModel } from '@/services/chatModel';
import { ChatMessage } from '@/types/chatMessage';
import { FetchSSEOptions, fetchSSE } from '@/utils/fetch';

import { SessionStore, chatSelectors, sessionSelectors } from '@/store/session';
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
  resendMessage: (id: string) => Promise<void>;

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

  clearMessage: () => void;
}

export const createChatSlice: StateCreator<SessionStore, [['zustand/devtools', never]], [], ChatAction> = (
  set,
  get,
) => ({
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

    const userId = nanoid();
    const assistantId = nanoid();
    dispatchMessage({ type: 'addMessage', role: 'user', message, id: userId });

    // 先拿到当前的 messages
    const messages = chatSelectors.currentChats(get());

    // 再添加一个空的信息用于放置 ai 响应，注意顺序不能反
    // 因为如果顺序反了，messages 中将包含新增的 ai message
    dispatchMessage({
      type: 'addMessage',
      role: 'assistant',
      message: LOADING_FLAT,
      id: assistantId,
      parentId: userId,
    });

    let output = '';
    // 生成 ai message
    await generateMessage(messages, {
      onMessageHandle: (text) => {
        output += text;

        dispatchMessage({ type: 'updateMessage', id: assistantId, key: 'content', value: output });

        // 滚动到最后一条消息
        const item = document.getElementById('for-loading');
        if (!item) return;

        item.scrollIntoView({ behavior: 'smooth' });
      },
      onErrorHandle: (error) => {
        dispatchMessage({ type: 'updateMessage', id: assistantId, key: 'error', value: error });
      },
    });
  },

  resendMessage: async (id) => {
    const {
      sendMessage,
      dispatchMessage,
      // generateMessage
    } = get();

    const session = sessionSelectors.currentChat(get());

    if (!session) return;

    const index = session.chats.findIndex((s) => s.id === id);
    if (index < 0) return;

    const message = session.chats[index];

    // 用户通过手动删除，造成了他的问题是最后一条消息
    // 这种情况下，相当于用户重新发送消息
    if (session.chats.length === index && message.role === 'user') {
      // 发送消息的时候会把传入的消息 message 新建一条，因此在发送前先把这条消息在记录中删除
      dispatchMessage({ type: 'deleteMessage', id: message.id });
      await sendMessage(message.content);
      return;
    }

    // 上下文消息就是当前消息之前的消息
    const contextMessages = session.chats.slice(0, index);

    // 上下文消息中最后一条消息
    const userMessage = contextMessages.at(-1)?.content;
    if (!userMessage) return;

    const targetMsg = session.chats[index];

    // 如果不是 assistant 的消息，那么需要额外插入一条消息
    if (targetMsg.role !== 'assistant') {
      // dispatchMessage({
      //   type: 'insertMessage',
      //   index,
      //   message: { role: 'assistant', content: LOADING_FLAT },
      // });
    } else {
      // 保存之前的消息为历史消息
      // dispatchMessage({ type: 'updateMessage', message: botPrevMsg, index });
      // dispatchMessage({ type: 'updateMessage', message: LOADING_FLAT, index });
    }

    // 重置错误信息
    dispatchMessage({ type: 'updateMessage', value: undefined, key: 'error', id: targetMsg.id });

    // 开始更新消息

    // await generateMessage(userMessage, contextMessages, {
    //   onMessageHandle: (text) => {
    //     currentResponse = [...currentResponse, text];
    //     dispatchMessage({ type: 'updateMessage', message: currentResponse.join(''), index });
    //   },
    //   onErrorHandle: (error) => {
    //     dispatchMessage({ type: 'updateMessage' });
    //   },
    // });
  },

  clearMessage: () => {
    get().dispatchMessage({ type: 'resetMessages' });
  },
});
