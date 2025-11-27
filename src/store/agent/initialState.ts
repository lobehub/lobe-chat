import { AgentSliceState, initialAgentSliceState } from './slices/agent';
import { BuiltinAgentSliceState, initialBuiltinAgentSliceState } from './slices/builtin';

export type AgentStoreState = AgentSliceState & BuiltinAgentSliceState;

export const initialState: AgentStoreState = {
  ...initialAgentSliceState,
  ...initialBuiltinAgentSliceState,
};
