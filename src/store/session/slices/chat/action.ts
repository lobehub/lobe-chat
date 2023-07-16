import { StateCreator } from 'zustand/vanilla';

import { fetchChatModel } from '@/services/chatModel';
import { SessionStore, chatSelectors, sessionSelectors } from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';
import { FetchSSEOptions, fetchSSE } from '@/utils/fetch';
import { nanoid } from '@/utils/uuid';

import { MessageDispatch, messagesReducer } from './messageReducer';

const LOADING_FLAT = '...';

export interface ChatAction {
  clearMessage: () => void;
  createOrSendMsg: (text: string) => Promise<void>;

  deleteMessage: (id: string) => void;

  /**
   * @title 派发消息
   * @param payload - 消息分发
   * @returns void
   */
  dispatchMessage: (payload: MessageDispatch) => void;
  generateMessage: (messages: ChatMessage[], options: FetchSSEOptions) => Promise<void>;

  /**
   * @title 处理消息编辑
   * @param index - 消息索引或空
   * @returns void
   */
  handleMessageEditing: (messageId: string | undefined) => void;
  /**
   * @title 重发消息
   * @param index - 消息索引
   * @returns Promise<void>
   */
  resendMessage: (id: string) => Promise<void>;
  /**
   * @title 发送消息
   * @returns Promise<void>
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

    console.log(message);
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

    const fetcher = () => fetchChatModel({ messages });

    await fetchSSE(fetcher, options);

    set({ chatLoading: false });
  },

  handleMessageEditing: (messageId) => {
    set({ editingMessageId: messageId });
  },

  resendMessage: async () => {
    //   const {
    //     sendMessage,
    //     dispatchMessage,
    //     // generateMessage
    //   } = get();
    //
    //   const session = sessionSelectors.currentSession(get());
    //
    //   if (!session) return;
    //
    //   const index = session.chats.findIndex((s) => s.id === id);
    //   if (index < 0) return;
    //
    //   const message = session.chats[index];
    //
    //   // 用户通过手动删除，造成了他的问题是最后一条消息
    //   // 这种情况下，相当于用户重新发送消息
    //   if (session.chats.length === index && message.role === 'user') {
    //     // 发送消息的时候会把传入的消息 message 新建一条，因此在发送前先把这条消息在记录中删除
    //     dispatchMessage({ id: message.id, type: 'deleteMessage' });
    //     await sendMessage(message.content);
    //     return;
    //   }
    //
    //   // 上下文消息就是当前消息之前的消息
    //   const contextMessages = session.chats.slice(0, index);
    //
    //   // 上下文消息中最后一条消息
    //   const userMessage = contextMessages.at(-1)?.content;
    //   if (!userMessage) return;
    //
    //   const targetMessage = session.chats[index];
    //
    //   // 如果不是 assistant 的消息，那么需要额外插入一条消息
    //   if (targetMessage.role === 'assistant') {
    //     // 保存之前的消息为历史消息
    //     // dispatchMessage({ type: 'updateMessage', message: botPrevMsg, index });
    //     // dispatchMessage({ type: 'updateMessage', message: LOADING_FLAT, index });
    //   } else {
    //     // dispatchMessage({
    //     //   type: 'insertMessage',
    //     //   index,
    //     //   message: { role: 'assistant', content: LOADING_FLAT },
    //     // });
    //   }
    //
    //   // 重置错误信息
    //   dispatchMessage({
    //     id: targetMessage.id,
    //     key: 'error',
    //     type: 'updateMessage',
    //     value: undefined,
    //   });
    //
    //   // 开始更新消息
    //
    //   // await generateMessage(userMessage, contextMessages, {
    //   //   onMessageHandle: (text) => {
    //   //     currentResponse = [...currentResponse, text];
    //   //     dispatchMessage({ type: 'updateMessage', message: currentResponse.join(''), index });
    //   //   },
    //   //   onErrorHandle: (error) => {
    //   //     dispatchMessage({ type: 'updateMessage' });
    //   //   },
    //   // });
  },

  sendMessage: async (message) => {
    const { dispatchMessage, generateMessage } = get();
    const session = sessionSelectors.currentSession(get());
    if (!session || !message) return;

    const userId = nanoid();
    const assistantId = nanoid();
    dispatchMessage({ id: userId, message, role: 'user', type: 'addMessage' });

    // 先拿到当前的 messages
    const messages = chatSelectors.currentChats(get());

    // 再添加一个空的信息用于放置 ai 响应，注意顺序不能反
    // 因为如果顺序反了，messages 中将包含新增的 ai message
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

        dispatchMessage({ id: assistantId, key: 'content', type: 'updateMessage', value: output });

        // 滚动到最后一条消息
        const item = document.querySelector('#for-loading');
        if (!item) return;

        item.scrollIntoView({ behavior: 'smooth' });
      },
    });
  },
});
