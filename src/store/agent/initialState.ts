import { AgentState, initialAgentChatState } from './slices/chat/initialState';

export type SessionStoreState = AgentState;

export const initialState: SessionStoreState = {
  ...initialAgentChatState,
};
