import type { AgentState } from './state';

/**
 * Group Orchestration Phase Types
 */
export type GroupOrchestrationPhase =
  | 'call_supervisor'
  | 'speak'
  | 'broadcast'
  | 'delegate'
  | 'agent_spoke'
  | 'agents_broadcasted';

/**
 * Group Orchestration Runtime Context
 */
export interface GroupOrchestrationContext {
  operationId?: string;
  payload?: Record<string, unknown>;
  phase: GroupOrchestrationPhase | string;
}

/**
 * Group Orchestration Instructions
 */
export interface GroupOrchestrationInstructionCallSupervisor {
  payload: {
    groupId: string;
    round: number;
    supervisorAgentId: string;
  };
  type: 'call_supervisor';
}

export interface GroupOrchestrationInstructionSpeak {
  payload: {
    agentId: string;
    instruction?: string;
  };
  type: 'speak';
}

export interface GroupOrchestrationInstructionBroadcast {
  payload: {
    agentIds: string[];
    instruction?: string;
    /**
     * The tool message ID that triggered the broadcast
     * Used as parentId for agent responses to build correct message tree
     */
    toolMessageId: string;
  };
  type: 'broadcast';
}

export interface GroupOrchestrationInstructionDelegate {
  payload: {
    agentId: string;
    task: string;
  };
  type: 'delegate';
}

export interface GroupOrchestrationInstructionAgentSpoke {
  payload: {
    agentId: string;
    completed: boolean;
  };
  type: 'agent_spoke';
}

export interface GroupOrchestrationInstructionAgentsBroadcasted {
  payload: {
    agentIds: string[];
    completed: boolean;
  };
  type: 'agents_broadcasted';
}

export interface GroupOrchestrationInstructionFinish {
  reason: string;
  type: 'finish';
}

export type GroupOrchestrationInstruction =
  | GroupOrchestrationInstructionAgentSpoke
  | GroupOrchestrationInstructionAgentsBroadcasted
  | GroupOrchestrationInstructionBroadcast
  | GroupOrchestrationInstructionCallSupervisor
  | GroupOrchestrationInstructionDelegate
  | GroupOrchestrationInstructionFinish
  | GroupOrchestrationInstructionSpeak;

/**
 * Group Orchestration Supervisor Interface
 * Note: This is an independent interface, NOT extending Agent
 */
export interface IGroupOrchestrationSupervisor {
  runner(
    context: GroupOrchestrationContext,
    state: AgentState,
  ): Promise<GroupOrchestrationInstruction>;
}

/**
 * Group Orchestration Event Types
 */
export interface GroupOrchestrationEventSupervisorFinished {
  type: 'supervisor_finished';
}

export interface GroupOrchestrationEventAgentSpoke {
  agentId: string;
  type: 'agent_spoke';
}

export interface GroupOrchestrationEventAgentsBroadcasted {
  agentIds: string[];
  type: 'agents_broadcasted';
}

export interface GroupOrchestrationEventMaxRoundsExceeded {
  type: 'max_rounds_exceeded';
}

export interface GroupOrchestrationEventDone {
  reason: string;
  type: 'done';
}

export type GroupOrchestrationEvent =
  | GroupOrchestrationEventAgentSpoke
  | GroupOrchestrationEventAgentsBroadcasted
  | GroupOrchestrationEventDone
  | GroupOrchestrationEventMaxRoundsExceeded
  | GroupOrchestrationEventSupervisorFinished;

/**
 * Group Orchestration Executor Result
 */
export interface GroupOrchestrationExecutorResult {
  events: GroupOrchestrationEvent[];
  newState: AgentState;
  nextContext?: GroupOrchestrationContext;
}

/**
 * Group Orchestration Executor Type
 */
export type GroupOrchestrationExecutor = (
  instruction: GroupOrchestrationInstruction,
  state: AgentState,
) => Promise<GroupOrchestrationExecutorResult>;

/**
 * Group Orchestration Runtime Config
 */
export interface GroupOrchestrationRuntimeConfig {
  executors: Partial<Record<GroupOrchestrationInstruction['type'], GroupOrchestrationExecutor>>;
  getOperation?: (operationId: string) => {
    abortController: AbortController;
    context: Record<string, unknown>;
  };
  operationId?: string;
}
