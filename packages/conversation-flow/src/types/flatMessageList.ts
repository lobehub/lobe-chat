import type { UIChatMessage } from '@lobechat/types';

/**
 * Flat Message List Types
 *
 * Flattened array optimized for virtual list rendering.
 * Contains virtual messages with extended role types for grouped display.
 */

/**
 * Extended message role types for flat list rendering
 *
 * Standard roles from UIChatMessage:
 * - 'user': User message
 * - 'assistant': Assistant message (standalone, without tools)
 * - 'tool': Tool execution result
 * - 'system': System message
 * - 'supervisor': Supervisor message in multi-agent
 *
 * Virtual roles created by parse():
 * - 'assistantGroup': Assistant message + tool calls aggregation
 * - 'messageGroup': Generic message group (manual/summary)
 * - 'compare': Compare mode for parallel model outputs
 */
export type FlatMessageRole =
  | 'user'
  | 'assistant'
  | 'tool'
  | 'system'
  | 'supervisor'
  | 'assistantGroup'
  | 'messageGroup'
  | 'compare';

/**
 * Message in flat list
 *
 * Can be either:
 * 1. Original message from database
 * 2. Virtual message created by parse() with extended role and children
 */
export type FlatMessage = UIChatMessage;

/**
 * Branch metadata attached to user messages
 */
export interface BranchMetadata {
  /** Current active branch index */
  current: number;
  /** Total number of branches */
  count: number;
  /** Branch items */
  items: Array<{
    id: string;
    createdAt: number;
  }>;
}

/**
 * Virtual message extra fields for flat list
 */
export interface FlatMessageExtra {
  /** Branch information for user messages with multiple children */
  branches?: BranchMetadata;
  /** Group mode for messageGroup and compare virtual messages */
  groupMode?: 'compare' | 'manual' | 'summary';
  /** Optional description for groups */
  description?: string;
  /** Parent message ID that triggered this group */
  parentMessageId?: string;
}
