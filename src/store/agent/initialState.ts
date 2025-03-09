import { AgentState, initialAgentChatState } from './slices/chat/initialState';

export type AgentStoreState = AgentState;

export const initialState: AgentStoreState = {
  ...initialAgentChatState,
};
