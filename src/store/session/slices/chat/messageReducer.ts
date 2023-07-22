import { produce } from 'immer';

import { ChatMessage, ChatMessageMap } from '@/types/chatMessage';
import { LLMRoleType } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { nanoid } from '@/utils/uuid';

interface AddMessage {
  id?: string;
  message: string;
  meta?: MetaData;
  parentId?: string;
  quotaId?: string;
  role: LLMRoleType;
  type: 'addMessage';
}

interface DeleteMessage {
  id: string;
  type: 'deleteMessage';
}

interface ResetMessages {
  type: 'resetMessages';
}

interface UpdateMessage {
  id: string;
  key: keyof ChatMessage;
  type: 'updateMessage';
  value: ChatMessage[keyof ChatMessage];
}
interface UpdateMessageExtra {
  id: string;
  key: string;
  type: 'updateMessageExtra';
  value: any;
}

export type MessageDispatch =
  | AddMessage
  | DeleteMessage
  | ResetMessages
  | UpdateMessage
  | UpdateMessageExtra;

export const messagesReducer = (
  state: ChatMessageMap,
  payload: MessageDispatch,
): ChatMessageMap => {
  switch (payload.type) {
    case 'addMessage': {
      return produce(state, (draftState) => {
        const mid = payload.id || nanoid();

        draftState[mid] = {
          content: payload.message,
          createAt: Date.now(),
          id: mid,
          meta: payload.meta || {},
          parentId: payload.parentId,
          quotaId: payload.quotaId,
          role: payload.role,
          updateAt: Date.now(),
        };
      });
    }

    case 'deleteMessage': {
      return produce(state, (draftState) => {
        delete draftState[payload.id];
      });
    }

    case 'updateMessage': {
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState[id];
        if (!message) return;

        // @ts-ignore
        message[key] = value;
        message.updateAt = Date.now();
      });
    }

    case 'updateMessageExtra': {
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState[id];
        if (!message) return;

        if (!message.extra) {
          message.extra = { [key]: value } as any;
        } else {
          message.extra[key] = value;
        }

        message.updateAt = Date.now();
      });
    }

    case 'resetMessages': {
      return {};
    }

    default: {
      throw new Error('暂未实现的 type，请检查 reducer');
    }
  }
};
