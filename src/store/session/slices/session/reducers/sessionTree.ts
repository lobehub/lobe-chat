import { produce } from 'immer';

import { SessionTree, SessionTreeNode } from '@/types';

export type SessionTreeDispatch =
  | { node: SessionTreeNode; type: 'addNode' }
  | { agentId: string; type: 'deleteNode' }
  | { fromIndex: number; toIndex: number; type: 'moveNode' }
  | { agentId: string; chat: string; type: 'addChat' }
  | { chatId: string; type: 'deleteChat' }
  | { agentId: string; chatIndex: number; toIndex: number; type: 'sortChat' };

export const sessionTreeReducer = (
  state: SessionTree,
  action: SessionTreeDispatch,
): SessionTree => {
  switch (action.type) {
    case 'addNode': {
      return produce(state, (draftState) => {
        const timestamp = Date.now();
        draftState.unshift({
          ...action.node,
          createAt: timestamp,
          updateAt: timestamp,
        });
      });
    }

    case 'deleteNode': {
      return state.filter((node) => node.agentId !== action.agentId);
    }

    case 'moveNode': {
      return produce(state, (draftState) => {
        const [removed] = draftState.splice(action.fromIndex, 1);
        draftState.splice(action.toIndex, 0, removed);
      });
    }

    case 'addChat': {
      return produce(state, (draftState) => {
        const nodeIndex = draftState.findIndex((node) => node.agentId === action.agentId);
        if (nodeIndex !== -1) {
          draftState[nodeIndex].chats.push(action.chat);
          draftState[nodeIndex].updateAt = Date.now();
        }
      });
    }

    case 'deleteChat': {
      return produce(state, (draftState) => {
        for (const node of draftState) {
          const nextChats = node.chats.filter((c) => c !== action.chatId);
          if (nextChats.length !== node.chats.length) {
            node.chats = nextChats;
            node.updateAt = Date.now();
          }
        }
      });
    }

    case 'sortChat': {
      return produce(state, (draftState) => {
        const nodeIndex = draftState.findIndex((node) => node.agentId === action.agentId);
        if (nodeIndex !== -1) {
          const [removed] = draftState[nodeIndex].chats.splice(action.chatIndex, 1);
          draftState[nodeIndex].chats.splice(action.toIndex, 0, removed);
          draftState[nodeIndex].updateAt = Date.now();
        }
      });
    }

    default: {
      return state;
    }
  }
};
