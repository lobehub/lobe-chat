import type { UIChatMessage } from '@lobechat/types';

/**
 * Re-export UIChatMessage as Message for convenience
 */
export type Message = UIChatMessage;

/**
 * Base interface for all display nodes
 */
interface BaseNode {
  /** Unique identifier for this node */
  id: string;
  /** Type discriminator */
  type: 'MESSAGE' | 'GROUP' | 'COMPARE' | 'BRANCH' | 'THREAD';
}

/**
 * Basic message node - renders a single message
 */
export interface MessageNode extends BaseNode {
  type: 'MESSAGE';
  /** Reference to the message in messageMap */
  messageId: string;
  /** Child nodes to render after this message */
  children: DisplayNode[];
}

/**
 * Group node - aggregates an assistant message with its tool calls
 */
export interface GroupNode extends BaseNode {
  type: 'GROUP';
  /** The assistant message ID */
  assistantMessageId: string;
  /** Tool call message nodes */
  tools: MessageNode[];
}

/**
 * Compare node - renders multiple parallel outputs side by side
 */
export interface CompareNode extends BaseNode {
  type: 'COMPARE';
  /** The message that triggered the comparison */
  messageId: string;
  /** Each column represents a parallel output tree */
  columns: DisplayNode[][];
}

/**
 * Branch node - represents multiple alternate conversation paths
 */
export interface BranchNode extends BaseNode {
  type: 'BRANCH';
  /** The parent message that has multiple branches */
  parentMessageId: string;
  /** Index of the currently active branch */
  activeBranchIndex: number;
  /** Each branch is a separate conversation tree */
  branches: DisplayNode[][];
}

/**
 * Thread node - represents a nested sub-conversation
 */
export interface ThreadNode extends BaseNode {
  type: 'THREAD';
  /** The message that started this thread */
  parentMessageId: string;
  /** Thread identifier */
  threadId: string;
  /** The conversation tree within this thread */
  children: DisplayNode[];
}

/**
 * Union type of all display nodes
 */
export type DisplayNode = MessageNode | GroupNode | CompareNode | BranchNode | ThreadNode;

/**
 * Internal structure node used during tree building
 */
export interface IdNode {
  id: string;
  children: IdNode[];
}

/**
 * Result of the parse function
 */
export interface ParseResult {
  /** Map for O(1) message access */
  messageMap: Map<string, Message>;
  /** Semantic view model for rendering */
  displayTree: DisplayNode[];
}

/**
 * Internal helper maps used during parsing
 */
export interface HelperMaps {
  /** Maps message ID to message */
  messageMap: Map<string, Message>;
  /** Maps parent ID to array of child IDs */
  childrenMap: Map<string | null, string[]>;
  /** Maps thread ID to all messages in that thread */
  threadMap: Map<string, Message[]>;
}
