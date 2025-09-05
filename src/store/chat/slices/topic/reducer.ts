import { produce } from 'immer';

import { CreateTopicParams } from '@/services/topic/type';
import { ChatTopic } from '@/types/topic';

interface AddChatTopicAction {
  type: 'addTopic';
  value: CreateTopicParams & { id?: string };
}

interface UpdateChatTopicAction {
  id: string;
  type: 'updateTopic';
  value: Partial<ChatTopic>;
}

interface UpdateTopicsAction {
  type: 'updateTopics';
  value: ChatTopic[];
}

interface DeleteChatTopicAction {
  id: string;
  type: 'deleteTopic';
}

export type ChatTopicDispatch =
  | AddChatTopicAction
  | UpdateChatTopicAction
  | DeleteChatTopicAction
  | UpdateTopicsAction;

export const topicReducer = (state: ChatTopic[] = [], payload: ChatTopicDispatch): ChatTopic[] => {
  switch (payload.type) {
    case 'addTopic': {
      return produce(state, (draftState) => {
        draftState.unshift({
          ...payload.value,
          createdAt: Date.now(),
          favorite: false,
          id: payload.value.id ?? Date.now().toString(),
          sessionId: payload.value.sessionId ? payload.value.sessionId : undefined,
          updatedAt: Date.now(),
        });

        return draftState.sort((a, b) => Number(b.favorite) - Number(a.favorite));
      });
    }

    case 'updateTopic': {
      return produce(state, (draftState) => {
        const { value, id } = payload;
        const topicIndex = draftState.findIndex((topic) => topic.id === id);

        if (topicIndex !== -1) {
          // TODO: updatedAt 类型后续需要修改为 Date
          // @ts-ignore
          draftState[topicIndex] = { ...draftState[topicIndex], ...value, updatedAt: new Date() };
        }
      });
    }

    case 'updateTopics': {
      return payload.value;
    }

    case 'deleteTopic': {
      return produce(state, (draftState) => {
        const topicIndex = draftState.findIndex((topic) => topic.id === payload.id);
        if (topicIndex !== -1) {
          draftState.splice(topicIndex, 1);
        }
      });
    }

    default: {
      return state;
    }
  }
};
