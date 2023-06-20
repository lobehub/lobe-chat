import { produce } from 'immer';

import { ChatMessage } from '@/types/chatMessage';
import { LLMRoleType } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { nanoid } from '@/utils/uuid';

interface AddMessage {
  type: 'addMessage';
  message: string;
  role: LLMRoleType;
  id?: string;
  quotaId?: string;
  parentId?: string;
  meta?: MetaData;
}

interface InsertMessage {
  type: 'insertMessage';
  message: ChatMessage;
  index: number;
}

interface DeleteMessage {
  type: 'deleteMessage';
  index: number;
}

interface ResetMessages {
  type: 'resetMessages';
}

interface UpdateMessage {
  type: 'updateMessage';
  id: string;
  key: keyof ChatMessage;
  value: ChatMessage[keyof ChatMessage];
}

export type MessageDispatch =
  | AddMessage
  | InsertMessage
  | DeleteMessage
  | ResetMessages
  | UpdateMessage;

export const messagesReducer = (state: ChatMessage[], payload: MessageDispatch): ChatMessage[] => {
  switch (payload.type) {
    case 'addMessage':
      return produce(state, (draftState) => {
        draftState.push({
          id: payload.id || nanoid(),
          role: payload.role,
          content: payload.message,
          meta: payload.meta || {},
          quotaId: payload.quotaId,
          parentId: payload.parentId,
          updateAt: Date.now(),
          createAt: Date.now(),
        });
      });

    case 'insertMessage':
      return produce(state, (draftState) => {
        draftState.splice(payload.index, 0, payload.message);
      });

    case 'deleteMessage':
      return state.filter((_, i) => i !== payload.index);

    case 'updateMessage':
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState.find((m) => m.id === id);
        if (!message) return;

        // @ts-ignore
        message[key] = value;
        message.updateAt = Date.now();
      });

    case 'resetMessages':
      return [];

    default:
      throw Error('暂未实现的 type，请检查 reducer');
  }
};
