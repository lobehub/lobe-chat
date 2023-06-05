import { SessionTree, SessionTreeNode } from '@/types';
import { produce } from 'immer';

export type SessionTreeDispatch =
  | { type: 'addNode'; node: SessionTreeNode }
  | { type: 'deleteNode'; agentId: string }
  | { type: 'moveNode'; fromIndex: number; toIndex: number }
  | { type: 'addChat'; agentId: string; chat: string }
  | { type: 'deleteChat'; chatId: string }
  | { type: 'sortChat'; agentId: string; chatIndex: number; toIndex: number };

export const sessionTreeReducer = (
  state: SessionTree,
  action: SessionTreeDispatch,
): SessionTree => {
  switch (action.type) {
    case 'addNode':
      return produce(state, (draftState) => {
        const timestamp = Date.now();
        draftState.unshift({
          ...action.node,
          createAt: timestamp,
          updateAt: timestamp,
        });
      });

    case 'deleteNode':
      return state.filter((node) => node.agentId !== action.agentId);

    case 'moveNode':
      return produce(state, (draftState) => {
        const [removed] = draftState.splice(action.fromIndex, 1);
        draftState.splice(action.toIndex, 0, removed);
      });

    case 'addChat':
      return produce(state, (draftState) => {
        const nodeIndex = draftState.findIndex((node) => node.agentId === action.agentId);
        if (nodeIndex !== -1) {
          draftState[nodeIndex].chats.push(action.chat);
          draftState[nodeIndex].updateAt = Date.now();
        }
      });

    case 'deleteChat':
      return produce(state, (draftState) => {
        draftState.forEach((node) => {
          const nextChats = node.chats.filter((c) => c !== action.chatId);
          if (nextChats.length !== node.chats.length) {
            node.chats = nextChats;
            node.updateAt = Date.now();
          }
        });
      });

    case 'sortChat':
      return produce(state, (draftState) => {
        const nodeIndex = draftState.findIndex((node) => node.agentId === action.agentId);
        if (nodeIndex !== -1) {
          const [removed] = draftState[nodeIndex].chats.splice(action.chatIndex, 1);
          draftState[nodeIndex].chats.splice(action.toIndex, 0, removed);
          draftState[nodeIndex].updateAt = Date.now();
        }
      });

    default:
      return state;
  }
};
