import { buildHelperMaps } from './indexing';
import { buildIdTree } from './structuring';
import { Transformer } from './transformation';
import type { Message, MessageGroupMetadata, ParseResult } from './types';

/**
 * Main parse function - the brain of the conversation flow engine
 *
 * Converts a flat array of messages into:
 * 1. messageMap - for O(1) message access
 * 2. displayTree - semantic tree structure for navigation
 * 3. flatList - flattened array optimized for virtual list rendering
 *
 * Uses a three-phase parsing strategy:
 * 1. Indexing - build helper maps for efficient querying
 * 2. Structuring - convert flat data to tree structure
 * 3. Transformation - apply business logic to create semantic nodes and flat list
 *
 * @param messages - Flat array of messages from backend
 * @param messageGroups - Optional array of message group metadata for compare/manual grouping
 * @returns ParseResult containing messageMap, displayTree, and flatList
 */
export function parse(messages: Message[], messageGroups?: MessageGroupMetadata[]): ParseResult {
  // Phase 1: Indexing
  // Build helper maps for O(1) access patterns
  const helperMaps = buildHelperMaps(messages, messageGroups);

  // Phase 2: Structuring
  // Convert flat parent-child relationships to tree structure
  // Separates main flow from threaded conversations
  const idTree = buildIdTree(helperMaps);

  // Phase 3: Transformation
  // Apply priority-based pattern matching to create semantic display nodes
  const transformer = new Transformer(helperMaps);
  const contextTree = transformer.transformAll(idTree);

  // Phase 3b: Generate flatList for virtual list rendering
  // Implements RFC priority-based pattern matching
  const flatList = transformer.flatten(messages);

  // Convert messageMap from Map to plain object for serialization
  const messageMapObj: Record<string, Message> = {};
  helperMaps.messageMap.forEach((message, id) => {
    messageMapObj[id] = message;
  });

  return {
    contextTree,
    flatList,
    messageMap: messageMapObj,
  };
}
