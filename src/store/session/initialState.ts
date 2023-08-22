import { AgentConfigState, initialAgentConfigState } from './slices/agentConfig/initialState';
import { ChatState, initialChatState } from './slices/chat/initialState';
import { SessionState, initialSessionState } from './slices/session/initialState';

export type SessionStoreState = SessionState & ChatState & AgentConfigState;

export const initialState: SessionStoreState = {
  ...initialSessionState,
  ...initialChatState,
  ...initialAgentConfigState,
};

export { initialLobeAgentConfig } from './slices/agentConfig';
export { initLobeSession } from './slices/session/initialState';
