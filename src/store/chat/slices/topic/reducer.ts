import { produce } from 'immer';

import { CreateTopicParams } from '@/services/topic/type';
import { ChatTopic } from '@/types/topic';

interface AddChatTopicAction {
  type: 'addTopic';
  value: CreateTopicParams;
}

interface UpdateChatTopicAction {
  id: string;
  key: keyof ChatTopic;
  type: 'updateTopic';
  value: any;
}

interface DeleteChatTopicAction {
  id: string;
  type: 'deleteTopic';
}

export type ChatTopicDispatch = AddChatTopicAction | UpdateChatTopicAction | DeleteChatTopicAction;

export const topicReducer = (state: ChatTopic[] = [], payload: ChatTopicDispatch): ChatTopic[] => {
  switch (payload.type) {
    case 'addTopic': {
      return produce(state, (draftState) => {
        draftState.unshift({
          ...payload.value,
          createdAt: Date.now(),
          id: Date.now().toString(),
          sessionId: payload.value.sessionId ? payload.value.sessionId : undefined,
          updatedAt: Date.now(),
        });
      });
    }

    case 'updateTopic': {
      return produce(state, (draftState) => {
        const { key, value, id } = payload;
        const topicIndex = draftState.findIndex((topic) => topic.id === id);

        if (topicIndex !== -1) {
          const updatedTopic = { ...draftState[topicIndex] };
          // @ts-ignore
          updatedTopic[key] = value;
          draftState[topicIndex] = updatedTopic;
          updatedTopic.updatedAt = Date.now();
        }
      });
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
