/* eslint-disable typescript-sort-keys/interface, sort-keys-fix/sort-keys-fix */
/**
 * Operation Type Definitions
 * Unified operation state management for all async operations
 */

/**
 * Operation type enumeration - covers all async operations
 */
export type OperationType =
  // === Message sending ===
  | 'sendMessage' // Send message to server
  | 'createTopic' // Auto create topic

  // === AI generation ===
  | 'generateAI' // AI generate response (entire agent runtime execution)
  | 'reasoning' // AI reasoning process (child operation)
  | 'regenerate' // Regenerate message
  | 'continue' // Continue generation

  // === RAG and retrieval ===
  | 'rag' // RAG retrieval flow (child operation)
  | 'searchWorkflow' // Search workflow

  // === Tool calling ===
  | 'toolCalling' // Tool calling (streaming, child operation)
  | 'pluginApi' // Plugin API call
  | 'builtinToolSearch' // Builtin tool: search
  | 'builtinToolInterpreter' // Builtin tool: code interpreter
  | 'builtinToolLocalSystem' // Builtin tool: local system

  // === Group Chat ===
  | 'supervisorDecision' // Supervisor decision
  | 'groupAgentGenerate' // Group agent generate

  // === Others ===
  | 'topicSummary' // Topic summary
  | 'historySummary'; // History summary

/**
 * Operation status
 */
export type OperationStatus =
  | 'pending' // Waiting to start (not currently used)
  | 'running' // Executing
  | 'paused' // Paused (for user intervention scenarios)
  | 'completed' // Successfully completed
  | 'cancelled' // User cancelled
  | 'failed'; // Execution failed

/**
 * Operation context - business entity associations
 * Captured when Operation is created, never changes afterwards
 */
export interface OperationContext {
  sessionId?: string; // Associated session ID (normal session or group)
  topicId?: string | null; // Associated topic ID (null means default topic)
  messageId?: string; // Associated message ID
  threadId?: string; // Associated thread ID (Portal Thread)
  groupId?: string; // Associated group ID (Group Chat)
  agentId?: string; // Associated agent ID (specific agent in Group Chat)
}

/**
 * Operation metadata
 */
export interface OperationMetadata {
  // Progress information
  progress?: {
    current: number;
    total: number;
    percentage?: number;
  };

  // Performance information
  startTime: number;
  endTime?: number;
  duration?: number;

  // Error information
  error?: {
    type: string;
    message: string;
    code?: string;
    details?: any;
  };

  // Cancel information
  cancelReason?: string;

  // Other metadata (extensible)
  [key: string]: any;
}

/**
 * Operation definition
 */
export interface Operation {
  // === Basic information ===
  id: string; // Unique operation ID (using nanoid)
  type: OperationType; // Operation type
  status: OperationStatus; // Operation status

  // === Context (core: capture and fix business context) ===
  context: OperationContext; // Associated entities, captured at creation

  // === Control ===
  abortController: AbortController; // Abort controller

  // === Metadata ===
  metadata: OperationMetadata;

  // === Dependencies ===
  parentOperationId?: string; // Parent operation ID (for operation nesting)
  childOperationIds?: string[]; // Child operation IDs

  // === UI display ===
  label?: string; // Operation display label (for UI)
  description?: string; // Operation description (for tooltip)
}

/**
 * Operation filter for querying operations
 */
export interface OperationFilter {
  type?: OperationType | OperationType[];
  status?: OperationStatus | OperationStatus[];
  sessionId?: string;
  topicId?: string | null;
  messageId?: string;
  threadId?: string;
  groupId?: string;
  agentId?: string;
}
