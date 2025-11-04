import { buildHelperMaps } from './indexing';
import { buildIdTree } from './structuring';
import { Transformer } from './transformation';
import type { Message, ParseResult } from './types';

/**
 * Main parse function - the brain of the conversation flow engine
 *
 * Converts a flat array of messages into:
 * 1. messageMap - for O(1) message access
 * 2. displayTree - semantic view model for rendering
 *
 * Uses a three-phase parsing strategy:
 * 1. Indexing - build helper maps for efficient querying
 * 2. Structuring - convert flat data to tree structure
 * 3. Transformation - apply business logic to create semantic nodes
 *
 * @param messages - Flat array of messages from backend
 * @returns ParseResult containing messageMap and displayTree
 */
export function parse(messages: Message[]): ParseResult {
  // Phase 1: Indexing
  // Build helper maps for O(1) access patterns
  const helperMaps = buildHelperMaps(messages);

  // Phase 2: Structuring
  // Convert flat parent-child relationships to tree structure
  // Separates main flow from threaded conversations
  const idTree = buildIdTree(helperMaps, messages);

  // Phase 3: Transformation
  // Apply priority-based pattern matching to create semantic display nodes
  const transformer = new Transformer(helperMaps);
  const displayTree = transformer.transformAll(idTree);

  return {
    messageMap: helperMaps.messageMap,
    displayTree,
  };
}
