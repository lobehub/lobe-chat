import type { IdNode, Message } from '../types';

/**
 * BranchResolver - Handles branch resolution logic
 *
 * Determines which branch should be active based on:
 * 1. metadata.activeBranchIndex (explicit index)
 * 2. Inferred from which branch has children
 * 3. Default to first branch
 */
export class BranchResolver {
  /**
   * Get active branch ID from IdNode structure (used in contextTree building)
   */
  getActiveBranchId(message: Message, idNode: IdNode): string {
    // Priority 1: Try to get from metadata.activeBranchIndex (index-based)
    const activeBranchIndex = (message.metadata as any)?.activeBranchIndex;
    if (
      typeof activeBranchIndex === 'number' &&
      activeBranchIndex >= 0 &&
      activeBranchIndex < idNode.children.length
    ) {
      return idNode.children[activeBranchIndex].id;
    }

    // Priority 2: Infer from which branch has children
    for (const child of idNode.children) {
      if (child.children.length > 0) {
        return child.id;
      }
    }

    // Default to first branch
    return idNode.children[0].id;
  }

  /**
   * Get active branch ID from flat list (used in flatList building)
   */
  getActiveBranchIdFromMetadata(
    message: Message,
    childIds: string[],
    childrenMap: Map<string | null, string[]>,
  ): string {
    // Priority 1: Try to get from metadata.activeBranchIndex (index-based)
    const activeBranchIndex = (message.metadata as any)?.activeBranchIndex;
    if (
      typeof activeBranchIndex === 'number' &&
      activeBranchIndex >= 0 &&
      activeBranchIndex < childIds.length
    ) {
      return childIds[activeBranchIndex];
    }

    // Priority 2: Infer from which child has descendants
    for (const childId of childIds) {
      const descendants = childrenMap.get(childId);
      if (descendants && descendants.length > 0) {
        return childId;
      }
    }

    // Default to first child
    return childIds[0];
  }
}
