import type { HelperMaps, IdNode, Message } from './types';

/**
 * Phase 2: Structuring
 * Converts flat parent-child relationships into a tree structure
 * Separates main flow from threaded conversations
 *
 * @param helperMaps - Maps built in indexing phase
 * @param messages - Original flat messages array
 * @returns Root nodes of the main conversation flow (idTree)
 */
export function buildIdTree(helperMaps: HelperMaps, messages: Message[]): IdNode[] {
  const { childrenMap, threadMap, messageMap } = helperMaps;

  // Filter out messages that belong to threads (they'll be processed separately)
  const mainFlowMessages = messages.filter((msg) => !msg.threadId);

  // Build tree recursively starting from root messages (parentId = null)
  const buildTree = (messageId: string): IdNode => {
    const childIds = childrenMap.get(messageId) ?? [];

    // Filter children to only include those in main flow (not in threads)
    const mainFlowChildIds = childIds.filter((childId) => {
      const child = messageMap.get(childId);
      return child && !child.threadId;
    });

    return {
      id: messageId,
      children: mainFlowChildIds.map((childId) => buildTree(childId)),
    };
  };

  // Get root message IDs (messages with parentId = null and no threadId)
  const rootIds = childrenMap.get(null) ?? [];
  const mainFlowRootIds = rootIds.filter((id) => {
    const msg = messageMap.get(id);
    return msg && !msg.threadId;
  });

  return mainFlowRootIds.map((rootId) => buildTree(rootId));
}
