/**
 * Builtin Tool Types
 *
 * Type definitions for the builtin tool execution framework.
 */

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
 * Context passed to builtin tool executors
 */
export interface BuiltinToolContext {
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
