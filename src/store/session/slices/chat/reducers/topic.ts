import { produce } from 'immer';

import { ChatTopic, ChatTopicMap } from '@/types/topic';

interface AddChatTopicAction {
  topic: ChatTopic;
  type: 'addChatTopic';
}

interface UpdateChatTopicAction {
  id: string;
  key: keyof ChatTopic;
  type: 'updateChatTopic';
  value: any;
}

interface FavorChatTopicAction {
  favorite: boolean;
  id: string;
  type: 'favorChatTopic';
}

interface DeleteChatTopicAction {
  id: string;
  type: 'deleteChatTopic';
}

export type ChatTopicDispatch =
  | AddChatTopicAction
  | UpdateChatTopicAction
  | DeleteChatTopicAction
  | FavorChatTopicAction;

export const topicReducer = (state: ChatTopicMap, payload: ChatTopicDispatch): ChatTopicMap => {
  switch (payload.type) {
    case 'addChatTopic': {
      return produce(state, (draftState) => {
        draftState[payload.topic.id] = payload.topic;
      });
    }

    case 'updateChatTopic': {
      return produce(state, (draftState) => {
        const { key, value, id } = payload;

        if (!draftState[id]) return;

        const topic = draftState[id];

        if (value !== undefined) {
          // @ts-ignore
          topic[key] = value;

          topic.updateAt = Date.now();
        }
      });
    }

    case 'favorChatTopic': {
      return produce(state, (draftState) => {
        const { favorite, id } = payload;

        if (!draftState[id]) return;

        const topic = draftState[id];

        topic.favorite = favorite;
      });
    }

    case 'deleteChatTopic': {
      return produce(state, (draftState) => {
        delete draftState[payload.id];
      });
    }

    default: {
      return state;
    }
  }
};
