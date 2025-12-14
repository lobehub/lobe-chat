/**
 * Builtin Tool Types
 *
 * Type definitions for the builtin tool execution framework.
 */
import type { AfterCompletionCallback } from '@/store/chat/slices/operation/types';

/**
 * Result returned by builtin tool executors
 */
export interface BuiltinToolResult {
  /**
   * The content to display in the tool message
   */
  content?: string;

  /**
   * Error information if the tool execution failed
   */
  error?: {
    body?: any;
    message: string;
    type: string;
  };

  /**
   * Metadata to attach to the tool message
   * Used to mark messages for special handling (e.g., agentCouncil for parallel display)
   */
  metadata?: Record<string, any>;

  /**
   * Plugin state for UI rendering
   */
  state?: any;

  /**
   * Whether to stop the current execution flow
   * - true: Stop execution (e.g., speak/broadcast in group management)
   * - false/undefined: Continue execution
   */
  stop?: boolean;

  /**
   * Whether the tool execution was successful
   */
  success: boolean;
}

/**
 * Base params for group orchestration callbacks
 */
export interface GroupOrchestrationBaseParams {
  /**
   * The supervisor agent ID (the one who called this tool)
   */
  supervisorAgentId: string;
}

/**
 * Params for triggerSpeak callback
 */
export interface TriggerSpeakParams extends GroupOrchestrationBaseParams {
  /**
   * The agent ID to speak
   */
  agentId: string;
  /**
   * Optional instruction for the agent
   */
  instruction?: string;
}

/**
 * Params for triggerBroadcast callback
 */
export interface TriggerBroadcastParams extends GroupOrchestrationBaseParams {
  /**
   * Array of agent IDs to broadcast to
   */
  agentIds: string[];
  /**
   * Optional instruction for the agents
   */
  instruction?: string;
  /**
   * The tool message ID that triggered the broadcast
   * Used as parentId for agent responses to build correct message tree
   */
  toolMessageId: string;
}

/**
 * Params for triggerDelegate callback
 */
export interface TriggerDelegateParams extends GroupOrchestrationBaseParams {
  /**
   * The agent ID to delegate to
   */
  agentId: string;
  /**
   * Optional reason for delegation
   */
  reason?: string;
}

/**
 * Group Orchestration callbacks for group management tools
 * These callbacks are used to trigger the next phase in multi-agent orchestration
 */
export interface GroupOrchestrationCallbacks {
  /**
   * Trigger broadcast to multiple agents
   */
  triggerBroadcast: (params: TriggerBroadcastParams) => Promise<void>;

  /**
   * Trigger delegate to a specific agent
   */
  triggerDelegate: (params: TriggerDelegateParams) => Promise<void>;

  /**
   * Trigger speak to a specific agent
   */
  triggerSpeak: (params: TriggerSpeakParams) => Promise<void>;
}

/**
 * Context passed to builtin tool executors
 */
export interface BuiltinToolContext {
  /**
   * The current agent ID executing this tool (supervisor agent in group context)
   * Used to identify which agent called the tool for orchestration purposes
   */
  agentId?: string;

  /**
   * The current group ID (only available in group chat context)
   * Used by group management tools to access group member information
   */
  groupId?: string;

  /**
   * Group orchestration callbacks (only available in group chat context)
   * Used by group management tools to trigger the next orchestration phase
   */
  groupOrchestration?: GroupOrchestrationCallbacks;

  /**
   * The tool message ID
   */
  messageId: string;

  /**
   * Optional callback for streaming updates
   * Only needed for tools that support streaming output
   */
  onStreamingUpdate?: (chunk: string) => Promise<void>;

  /**
   * The current operation ID (for abort signal)
   */
  operationId?: string;

  /**
   * Register a callback to execute after AgentRuntime completes
   * Used for actions that should happen after the current execution flow finishes
   * to avoid race conditions with message updates
   *
   * @example
   * // In speak tool executor:
   * ctx.registerAfterCompletion(() =>
   *   ctx.groupOrchestration?.triggerSpeak(params)
   * );
   * return { success: true, stop: true };
   */
  registerAfterCompletion?: (callback: AfterCompletionCallback) => void;

  /**
   * AbortSignal for cancellation detection
   */
  signal?: AbortSignal;
}

/**
 * Builtin tool executor function type
 */
export type BuiltinToolExecutor<TParams = any> = (
  params: TParams,
  ctx: BuiltinToolContext,
) => Promise<BuiltinToolResult>;

/**
 * Interface for builtin tool executor class
 * Each executor class should implement this interface
 */
export interface IBuiltinToolExecutor {
  /**
   * Get all supported API names
   *
   * @returns Array of supported API names
   */
  getApiNames(): string[];

  /**
   * Check if this executor supports the given API
   *
   * @param apiName - The API name to check
   * @returns Whether the API is supported
   */
  hasApi(apiName: string): boolean;

  /**
   * The tool identifier (e.g., 'lobe-group-management')
   */
  readonly identifier: string;

  /**
   * Invoke a specific API of this tool
   *
   * @param apiName - The API name to invoke
   * @param params - Parameters for the API
   * @param ctx - Execution context
   * @returns The execution result
   */
  invoke(apiName: string, params: any, ctx: BuiltinToolContext): Promise<BuiltinToolResult>;
}

/**
 * Parameters for optimistic tool message update
 */
export interface OptimisticUpdateToolMessageParams {
  /**
   * The content to update
   */
  content?: string;

  /**
   * Error information to set
   */
  pluginError?: any;

  /**
   * Plugin state to set
   */
  pluginState?: any;
}

export { type AfterCompletionCallback } from '@/store/chat/slices/operation/types';
