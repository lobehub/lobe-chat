import { AgentState, initialAgentChatState } from './slices/chat/initialState';

/**
 * Agent Store 状态类型
 */
export type AgentStoreState = AgentState;

/**
 * Agent Store 初始状态
 */
export const initialState: AgentStoreState = {
  ...initialAgentChatState,
};
