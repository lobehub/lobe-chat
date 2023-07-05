import { ChatState, initialChatState } from './slices/chat';
import { SessionState, initialSessionState } from './slices/session';

export type SessionStoreState = SessionState & ChatState;

export const initialState: SessionStoreState = {
  ...initialSessionState,
  ...initialChatState,
};
