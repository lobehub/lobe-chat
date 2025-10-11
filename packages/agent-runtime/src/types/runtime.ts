import type { AgentEvent } from './event';
import { AgentInstruction, AgentRuntimeContext } from './instruction';
import { AgentState } from './state';

export type InstructionExecutor = (
  instruction: AgentInstruction,
  state: AgentState,
) => Promise<{
  events: AgentEvent[];
  newState: AgentState;
  /** Next context to pass to Agent runner (if execution should continue) */
  nextContext?: AgentRuntimeContext;
}>;

export interface RuntimeConfig {
  /** Custom executors for specific instruction types */
  executors?: Partial<Record<AgentInstruction['type'], InstructionExecutor>>;
}
