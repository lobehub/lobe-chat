import { ChatState, initialChatState } from './slices/chat/initialState';
import { SessionState, initialSessionState } from './slices/session/initialState';

export type SessionStoreState = SessionState & ChatState;

export const initialState: SessionStoreState = {
  ...initialSessionState,
  ...initialChatState,
};

export { initLobeSession } from './slices/session/initialState';
