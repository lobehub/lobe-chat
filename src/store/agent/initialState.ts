import { AgentSliceState, initialAgentSliceState } from './slices/agent';

export type AgentStoreState = AgentSliceState;

export const initialState: AgentStoreState = {
  ...initialAgentSliceState,
};
