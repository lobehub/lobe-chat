import { StateCreator } from 'zustand/vanilla';

import { SessionStoreState, initialState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agentConfig';
import { ChatAction, createChatSlice } from './slices/chat';
import { SessionAction, createSessionSlice } from './slices/session';

export type SessionStore = SessionAction & AgentAction & ChatAction & SessionStoreState;

export const createStore: StateCreator<SessionStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createAgentSlice(...parameters),
  ...createSessionSlice(...parameters),
  ...createChatSlice(...parameters),
});
