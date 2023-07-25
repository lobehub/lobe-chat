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

interface DeleteChatTopicAction {
  id: string;
  type: 'deleteChatTopic';
}

interface ToggleFavoriteAction {
  id: string;
  type: 'toggleFavorite';
}

interface AddChatAction {
  chat: string;
  id: string;
  type: 'addChat';
}

interface DeleteChatAction {
  id: string;
  index: number;
  type: 'deleteChat';
}

export type ChatTopicDispatch =
  | AddChatTopicAction
  | UpdateChatTopicAction
  | DeleteChatTopicAction
  | ToggleFavoriteAction
  | AddChatAction
  | DeleteChatAction;

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
        }
      });
    }

    case 'deleteChatTopic': {
      return produce(state, (draftState) => {
        delete draftState[payload.id];
      });
    }

    case 'toggleFavorite': {
      return produce(state, (draftState) => {
        const topic = draftState[payload.id];
        if (topic) {
          topic.favorite = !topic.favorite;
        }
      });
    }

    case 'addChat': {
      return produce(state, (draftState) => {
        const topic = draftState[payload.id];
        if (topic) {
          topic.chats.push(payload.chat);
        }
      });
    }

    case 'deleteChat': {
      return produce(state, (draftState) => {
        const topic = draftState[payload.id];
        if (topic) {
          topic.chats.splice(payload.index, 1);
        }
      });
    }

    default: {
      return state;
    }
  }
};
