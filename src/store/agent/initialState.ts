import { AgentState, initialSessionState } from './slices/chat/initialState';

export type SessionStoreState = AgentState;

export const initialState: SessionStoreState = {
  ...initialSessionState,
};
