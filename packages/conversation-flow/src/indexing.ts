import type { HelperMaps, Message } from './types';

/**
 * Phase 1: Indexing
 * Builds helper maps for efficient querying during parsing
 *
 * @param messages - Flat array of messages from backend
 * @returns Helper maps for efficient access
 */
export function buildHelperMaps(messages: Message[]): HelperMaps {
  const messageMap = new Map<string, Message>();
  const childrenMap = new Map<string | null, string[]>();
  const threadMap = new Map<string, Message[]>();

  // Single pass through messages to build all maps
  for (const message of messages) {
    // 1. Build messageMap for O(1) access
    messageMap.set(message.id, message);

    // 2. Build childrenMap for parent -> children lookup
    const parentId = message.parentId ?? null;
    const siblings = childrenMap.get(parentId);
    if (siblings) {
      siblings.push(message.id);
    } else {
      childrenMap.set(parentId, [message.id]);
    }

    // 3. Build threadMap for thread aggregation
    if (message.threadId) {
      const threadMessages = threadMap.get(message.threadId);
      if (threadMessages) {
        threadMessages.push(message);
      } else {
        threadMap.set(message.threadId, [message]);
      }
    }
  }

  return {
    messageMap,
    childrenMap,
    threadMap,
  };
}
