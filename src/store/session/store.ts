import { StateCreator } from 'zustand/vanilla';

import { initialState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agentSettings';
import { SessionAction, SessionState, createChatSlice } from './slices/session';

export type SessionStore = SessionAction & AgentAction & SessionState;

export const createStore: StateCreator<SessionStore, [['zustand/devtools', never]]> = (
  ...params
) => ({
  ...initialState,
  ...createAgentSlice(...params),
  ...createChatSlice(...params),
});
