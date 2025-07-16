import { produce } from 'immer';

import { ChatModelCard } from '@/types/llm';

export interface AddCustomModelCard {
  modelCard: ChatModelCard;
  type: 'add';
}

export interface DeleteCustomModelCard {
  id: string;
  type: 'delete';
}

export interface UpdateCustomModelCard {
  id: string;
  type: 'update';
  value: Partial<ChatModelCard>;
}

export type CustomModelCardDispatch =
  | AddCustomModelCard
  | DeleteCustomModelCard
  | UpdateCustomModelCard;

export const customModelCardsReducer = (
  state: ChatModelCard[] | undefined,
  payload: CustomModelCardDispatch,
): ChatModelCard[] => {
  switch (payload.type) {
    case 'add': {
      return produce(state || [], (draftState) => {
        const { id } = payload.modelCard;
        if (!id) return;
        if (draftState.some((card) => card.id === id)) return;

        draftState.push(payload.modelCard);
      });
    }

    case 'delete': {
      return produce(state || [], (draftState) => {
        const index = draftState.findIndex((card) => card.id === payload.id);
        if (index !== -1) {
          draftState.splice(index, 1);
        }
      });
    }

    case 'update': {
      return produce(state || [], (draftState) => {
        const index = draftState.findIndex((card) => card.id === payload.id);
        if (index !== -1) {
          const card = draftState[index];
          Object.assign(card, payload.value);
        }
      });
    }

    default: {
      throw new Error('Unhandled action type in customModelCardsReducer');
    }
  }
};
