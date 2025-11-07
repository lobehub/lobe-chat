/**
 * Type Index
 *
 * Centralized exports for all conversation flow types.
 * Types are organized into three categories:
 *
 * 1. Context Tree (types/contextTree.ts) - Tree structure for navigation
 * 2. Flat Message List (types/flatMessageList.ts) - Optimized for rendering
 * 3. Shared (types/shared.ts) - Common types used across modules
 */

// Context Tree Types
export type {
  AssistantGroupNode,
  BranchNode,
  CompareNode,
  ContextNode,
  MessageNode,
} from './types/contextTree';

// Flat Message List Types
export type {
  BranchMetadata,
  FlatMessage,
  FlatMessageExtra,
  FlatMessageRole,
} from './types/flatMessageList';

// Shared Types
export type {
  HelperMaps,
  IdNode,
  Message,
  MessageGroupMetadata,
  ParseResult,
} from './types/shared';
