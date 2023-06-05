import { ChatContext, ChatContextMap } from '@/types';
import { produce } from 'immer';

/**
 * @title 添加会话
 */
interface AddChats {
  /**
   * @param type - 操作类型
   * @default 'addChat'
   */
  type: 'addChat';
  /**
   * @param session - 会话信息
   */
  chat: ChatContext;
}

/**
 * @title 更新会话聊天上下文
 */
interface UpdateSessionChatContext {
  /**
   * @param type - 操作类型
   * @default 'updateSessionChatContext'
   */
  type: 'updateSessionChatContext';
  /**
   * 会话 ID
   */
  id: string;
  /**
   * @param key - 聊天上下文的键值
   */
  key: keyof ChatContext;
  /**
   * @param value - 聊天上下文的值
   */
  value: any;
}

export type HistoryDispatch =
  | AddChats
  | UpdateSessionChatContext
  | { type: 'removeChat'; id: string }
  | { type: 'updateChatTitle'; id: string; title: string }
  | { type: 'switchChat'; id: string };

export const sessionsReducer = (
  state: ChatContextMap,
  payload: HistoryDispatch,
): ChatContextMap => {
  switch (payload.type) {
    case 'addChat':
      return produce(state, (draft) => {
        draft[payload.chat.id] = payload.chat;
      });

    case 'removeChat':
      return produce(state, (draft) => {
        delete draft[payload.id];
      });

    case 'updateChatTitle':
      return produce(state, (draft) => {
        const chat = draft[payload.id];
        if (!chat) return;

        chat.title = payload.title;
      });

    case 'updateSessionChatContext':
      return produce(state, (draft) => {
        const chat = draft[payload.id];
        if (!chat) return;

        // @ts-ignore
        chat[payload.key] = payload.value;
      });

    default:
      return state;
  }
};
