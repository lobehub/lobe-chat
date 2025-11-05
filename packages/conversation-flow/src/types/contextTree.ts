import type { ModelPerformance, ModelUsage } from '@lobechat/types';

/**
 * Context Tree Types
 *
 * Tree structure for understanding conversation flow and navigation.
 * Used for complex operations like branch switching and context understanding.
 */

/**
 * Base interface for all display nodes
 */
interface BaseNode {
  /** Unique identifier for this node */
  id: string;
  /** Type discriminator */
  type: 'message' | 'assistantGroup' | 'compare' | 'branch';
}

/**
 * Basic message node - renders a single message
 */
export interface MessageNode extends BaseNode {
  /** Child nodes to render after this message */
  children: ContextNode[];
  /** Reference to the message in messageMap */
  messageId: string;
  type: 'message';
}

/**
 * Assistant group node - aggregates an assistant message with its tool calls
 */
export interface AssistantGroupNode extends BaseNode {
  /** The assistant message ID */
  assistantMessageId: string;
  /** Aggregated performance metrics from assistant and all tools */
  performance?: ModelPerformance;
  /** Tool call message nodes */
  tools: MessageNode[];
  type: 'assistantGroup';
  /** Aggregated token usage from assistant and all tools */
  usage?: ModelUsage;
}

/**
 * Compare node - renders multiple parallel outputs side by side
 */
export interface CompareNode extends BaseNode {
  /** Each column represents a parallel output tree */
  columns: ContextNode[][];
  /** The message that triggered the comparison */
  messageId: string;
  type: 'compare';
}

/**
 * Branch node - represents multiple alternate conversation paths
 */
export interface BranchNode extends BaseNode {
  /** Index of the currently active branch */
  activeBranchIndex: number;
  /** Each branch is a separate conversation tree */
  branches: ContextNode[][];
  /** The parent message that has multiple branches */
  parentMessageId: string;
  type: 'branch';
}

/**
 * Union type of all display nodes
 */
export type ContextNode = MessageNode | AssistantGroupNode | CompareNode | BranchNode;
