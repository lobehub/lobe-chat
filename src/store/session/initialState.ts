import { AgentConfigState, initialAgentConfigState } from './slices/agentConfig';
import { ChatState, initialChatState } from './slices/chat';
import { SessionState, initialSessionState } from './slices/session';

export type SessionStoreState = SessionState & ChatState & AgentConfigState;

export const initialState: SessionStoreState = {
  ...initialSessionState,
  ...initialChatState,
  ...initialAgentConfigState,
};
