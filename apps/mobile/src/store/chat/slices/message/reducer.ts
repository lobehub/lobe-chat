import { ChatMessage } from '@/types/message';

// 简化的 Message Dispatch 类型
export interface MessageDispatch {
  content?: string;
  id?: string;
  message?: Partial<ChatMessage>;
  messages?: ChatMessage[];
  sessionId?: string;
  topicId?: string;
  type: 'addMessage' | 'addMessages' | 'updateMessage' | 'updateMessageContent' | 'deleteMessage';
}

// 简化的 messages reducer，主要用于类型定义
// 实际的 reducer 逻辑在 action 的 internal_dispatchMessage 中处理
export const messagesReducer = (
  messages: ChatMessage[],
  action: MessageDispatch,
): ChatMessage[] => {
  switch (action.type) {
    case 'addMessage': {
      return action.message ? [...messages, action.message as ChatMessage] : messages;
    }

    case 'addMessages': {
      return action.messages || [];
    }

    case 'updateMessage': {
      return messages.map((msg) =>
        msg.id === action.id && action.message ? { ...msg, ...action.message } : msg,
      );
    }

    case 'updateMessageContent': {
      return messages.map((msg) =>
        msg.id === action.id
          ? { ...msg, content: action.content || '', updatedAt: Date.now() }
          : msg,
      );
    }

    case 'deleteMessage': {
      return messages.filter((msg) => msg.id !== action.id);
    }

    default: {
      return messages;
    }
  }
};
