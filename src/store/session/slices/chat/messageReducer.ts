import { produce } from 'immer';

import { ChatMessage, ChatMessageMap } from '@/types/chatMessage';
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

interface DeleteMessage {
  type: 'deleteMessage';
  id: string;
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

export type MessageDispatch = AddMessage | DeleteMessage | ResetMessages | UpdateMessage;

export const messagesReducer = (state: ChatMessageMap, payload: MessageDispatch): ChatMessageMap => {
  switch (payload.type) {
    case 'addMessage':
      return produce(state, (draftState) => {
        const mid = payload.id || nanoid();

        draftState[mid] = {
          id: mid,
          role: payload.role,
          content: payload.message,
          meta: payload.meta || {},
          quotaId: payload.quotaId,
          parentId: payload.parentId,
          updateAt: Date.now(),
          createAt: Date.now(),
        };
      });

    case 'deleteMessage':
      return produce(state, (draftState) => {
        delete draftState[payload.id];
      });

    case 'updateMessage':
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState[id];
        if (!message) return;

        // @ts-ignore
        message[key] = value;
        message.updateAt = Date.now();
      });

    case 'resetMessages':
      return {};

    default:
      throw new Error('暂未实现的 type，请检查 reducer');
  }
};
