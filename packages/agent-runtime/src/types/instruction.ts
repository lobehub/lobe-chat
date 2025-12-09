import { ChatToolPayload, ModelUsage } from '@lobechat/types';

import type { FinishReason } from './event';
import { AgentState, ToolRegistry } from './state';
import type { Cost, CostCalculationContext, Usage } from './usage';

/**
 * Runtime execution context passed to Agent runner
 */
export interface AgentRuntimeContext {
  metadata?: Record<string, unknown>;

  /** Operation ID (links to Operation for business context) */
  operationId?: string;

  /** Phase-specific payload/context */
  payload?: unknown;
  /** Current execution phase */
  phase:
    | 'init'
    | 'user_input'
    | 'llm_result'
    | 'tool_result'
    | 'tools_batch_result'
    | 'human_response'
    | 'human_approved_tool'
    | 'human_abort'
    | 'error';

  /** Session info (kept for backward compatibility, will be optional in the future) */
  session?: {
    messageCount: number;
    sessionId: string;
    status: AgentState['status'];
    stepCount: number;
  };
  /** Usage statistics from the current step (if applicable) */
  stepUsage?: ModelUsage | unknown;
}

/**
 * Represents the "Brain" of an agent.
 * It contains all the decision-making logic and is completely stateless.
 */
export interface Agent {
  /**
   * Calculate cost from usage statistics
   * @param context - Cost calculation context with usage and limits
   * @returns Updated cost information
   */
  calculateCost?(context: CostCalculationContext): Cost;

  /**
   * Calculate usage statistics from operation results
   * @param operationType - Type of operation that was performed
   * @param operationResult - Result data from the operation
   * @param previousUsage - Previous usage statistics
   * @returns Updated usage statistics
   */
  calculateUsage?(
    operationType: 'llm' | 'tool' | 'human_interaction',
    operationResult: any,
    previousUsage: Usage,
  ): Usage;

  /** Optional custom executors mapping to extend runtime behaviors */
  executors?: Partial<Record<AgentInstruction['type'], any>>;

  /**
   * Model runtime function for LLM calls - Agent owns its model integration
   * @param payload - LLM call payload (messages, tools, etc.)
   * @returns Async iterable of streaming response chunks
   */
  modelRuntime?: (payload: unknown) => AsyncIterable<any>;

  /**
   * The core runner method. Based on the current execution context and state,
   * it decides what the next action should be.
   * @param context - Current runtime context with phase and payload
   * @param state - Complete agent state for reference
   */
  runner(
    context: AgentRuntimeContext,
    state: AgentState,
  ): Promise<AgentInstruction | AgentInstruction[]>;

  /** Optional tools registry held by the agent */
  tools?: ToolRegistry;
}

export interface CallLLMPayload {
  isFirstMessage?: boolean;
  messages: any[];
  model: string;
  parentId?: string;
  provider: string;
  tools: any[];
}

export interface CallingToolPayload {
  apiName: string;
  arguments: string;
  id: string;
  identifier: string;
  type: 'mcp' | 'default' | 'markdown' | 'standalone';
}

export interface HumanAbortPayload {
  /** Whether there are pending tool calls */
  hasToolsCalling?: boolean;
  /** Parent message ID (assistant message) */
  parentMessageId: string;
  /** Reason for the abort */
  reason: string;
  /** LLM result including content and tool_calls */
  result?: {
    content: string;
    tool_calls?: any[];
  };
  /** Pending tool calls that need to be cancelled */
  toolsCalling?: ChatToolPayload[];
}

export interface AgentInstructionCallLlm {
  payload: any;
  type: 'call_llm';
}

export interface AgentInstructionCallTool {
  payload: {
    parentMessageId: string;
    toolCalling: ChatToolPayload;
  };
  type: 'call_tool';
}

export interface AgentInstructionCallToolsBatch {
  payload: {
    parentMessageId: string;
    toolsCalling: ChatToolPayload[];
  } & any;
  type: 'call_tools_batch';
}

export interface AgentInstructionRequestHumanPrompt {
  metadata?: Record<string, unknown>;
  prompt: string;
  reason?: string;
  type: 'request_human_prompt';
}

export interface AgentInstructionRequestHumanSelect {
  metadata?: Record<string, unknown>;
  multi?: boolean;
  options: Array<{ label: string; value: string }>;
  prompt?: string;
  reason?: string;
  type: 'request_human_select';
}

export interface AgentInstructionRequestHumanApprove {
  pendingToolsCalling: ChatToolPayload[];
  reason?: string;
  skipCreateToolMessage?: boolean;
  type: 'request_human_approve';
}

export interface AgentInstructionFinish {
  reason: FinishReason;
  reasonDetail?: string;
  type: 'finish';
}

export interface AgentInstructionResolveAbortedTools {
  payload: {
    /** Parent message ID (assistant message) */
    parentMessageId: string;
    /** Reason for the abort */
    reason?: string;
    /** Tool calls that need to be resolved/cancelled */
    toolsCalling: ChatToolPayload[];
  };
  type: 'resolve_aborted_tools';
}

/**
 * A serializable instruction object that the "Agent" (Brain) returns
 * to the "AgentRuntime" (Engine) to execute.
 */
export type AgentInstruction =
  | AgentInstructionCallLlm
  | AgentInstructionCallTool
  | AgentInstructionCallToolsBatch
  | AgentInstructionRequestHumanPrompt
  | AgentInstructionRequestHumanSelect
  | AgentInstructionRequestHumanApprove
  | AgentInstructionResolveAbortedTools
  | AgentInstructionFinish;
