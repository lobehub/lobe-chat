import isEqual from 'fast-deep-equal';
import { produce } from 'immer';

import { ChatMessage } from '@/types/message';
import { merge } from '@/utils/merge';

interface UpdateMessage {
  id: string;
  key: keyof ChatMessage;
  type: 'updateMessage';
  value: ChatMessage[keyof ChatMessage];
}

interface UpdatePluginState {
  id: string;
  key: string;
  type: 'updatePluginState';
  value: any;
}
interface UpdateMessageExtra {
  id: string;
  key: string;
  type: 'updateMessageExtra';
  value: any;
}

export type MessageDispatch = UpdateMessage | UpdatePluginState | UpdateMessageExtra;

export const messagesReducer = (state: ChatMessage[], payload: MessageDispatch): ChatMessage[] => {
  switch (payload.type) {
    case 'updateMessage': {
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message) return;

        // @ts-ignore
        message[key] = value;
        message.updatedAt = Date.now();
      });
    }

    case 'updateMessageExtra': {
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message) return;

        if (!message.extra) {
          message.extra = { [key]: value } as any;
        } else {
          message.extra[key] = value;
        }

        message.updateAt = Date.now();
      });
    }

    case 'updatePluginState': {
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message) return;

        let newState;
        if (!message.pluginState) {
          newState = { [key]: value } as any;
        } else {
          newState = merge(message.pluginState, { [key]: value });
        }

        if (isEqual(message.pluginState, newState)) return;

        message.pluginState = newState;
        message.updatedAt = Date.now();
      });
    }

    default: {
      throw new Error('暂未实现的 type，请检查 reducer');
    }
  }
};
