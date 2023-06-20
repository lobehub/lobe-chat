import { StateCreator } from 'zustand/vanilla';

import { initialState, SessionStoreState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agentSettings';
import { ChatAction, createChatSlice } from './slices/chat';
import { createSessionSlice, SessionAction } from './slices/session';

export type SessionStore = SessionAction & AgentAction & ChatAction & SessionStoreState;

export const createStore: StateCreator<SessionStore, [['zustand/devtools', never]]> = (
  ...params
) => ({
  ...initialState,
  ...createAgentSlice(...params),
  ...createSessionSlice(...params),
  ...createChatSlice(...params),
});
