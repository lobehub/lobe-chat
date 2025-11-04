import type {
  BranchNode,
  CompareNode,
  DisplayNode,
  GroupNode,
  HelperMaps,
  IdNode,
  Message,
  MessageNode,
  ThreadNode,
} from './types';

/**
 * Phase 3: Transformation
 * Converts structural idTree into semantic displayTree
 * Uses priority-based pattern matching to determine node types
 */
export class Transformer {
  private messageMap: Map<string, Message>;
  private threadMap: Map<string, Message[]>;
  private nodeIdCounter = 0;

  constructor(private helperMaps: HelperMaps) {
    this.messageMap = helperMaps.messageMap;
    this.threadMap = helperMaps.threadMap;
  }

  /**
   * Generates a unique node ID
   */
  private generateNodeId(prefix: string, messageId: string): string {
    return `${prefix}-${messageId}-${this.nodeIdCounter++}`;
  }

  /**
   * Main transform function - converts IdNode to DisplayNode
   * Implements priority-based pattern matching
   */
  transform(idNode: IdNode): DisplayNode {
    const message = this.messageMap.get(idNode.id);
    if (!message) {
      throw new Error(`Message not found: ${idNode.id}`);
    }

    // Priority 1: Explicit Compare instruction from metadata
    if (this.isCompareNode(message)) {
      return this.createCompareNode(message, idNode);
    }

    // Priority 2: Thread container detection
    const threadNode = this.tryCreateThreadNode(message, idNode);
    if (threadNode) {
      return threadNode;
    }

    // Priority 3: Assistant + Tools aggregation (GroupNode)
    if (this.isGroupNode(message, idNode)) {
      return this.createGroupNode(message, idNode);
    }

    // Priority 4: Multiple children = Branch
    if (idNode.children.length > 1) {
      return this.createBranchNode(message, idNode);
    }

    // Priority 5: Default MessageNode
    return this.createMessageNode(message, idNode);
  }

  /**
   * Priority 1: Check if message has explicit compare mode
   */
  private isCompareNode(message: Message): boolean {
    return message.metadata?.presentation?.mode === 'compare';
  }

  /**
   * Create CompareNode - side-by-side comparison
   */
  private createCompareNode(message: Message, idNode: IdNode): CompareNode {
    const columns = idNode.children.map((child) => {
      const childTree = this.transform(child);
      return [childTree];
    });

    return {
      type: 'COMPARE',
      id: this.generateNodeId('compare', message.id),
      messageId: message.id,
      columns,
    };
  }

  /**
   * Priority 2: Check if any child starts a thread
   */
  private tryCreateThreadNode(message: Message, idNode: IdNode): ThreadNode | null {
    // Check if current message has no threadId but has children with threadId
    if (message.threadId) {
      return null;
    }

    for (const child of idNode.children) {
      const childMessage = this.messageMap.get(child.id);
      if (childMessage?.threadId) {
        // Found a thread entry point
        const threadMessages = this.threadMap.get(childMessage.threadId);
        if (!threadMessages) {
          continue;
        }

        // Recursively parse the thread as a separate conversation
        // This is where we'd call parse() again, but to avoid circular dependency,
        // we'll create a simplified version for thread messages
        const threadTree = this.buildThreadTree(threadMessages, childMessage.threadId);

        return {
          type: 'THREAD',
          id: this.generateNodeId('thread', message.id),
          parentMessageId: message.id,
          threadId: childMessage.threadId,
          children: threadTree,
        };
      }
    }

    return null;
  }

  /**
   * Build display tree for thread messages
   */
  private buildThreadTree(threadMessages: Message[], threadId: string): DisplayNode[] {
    // Find root messages in this thread (messages with parentId not in thread)
    const threadMessageIds = new Set(threadMessages.map((m) => m.id));
    const rootMessages = threadMessages.filter(
      (msg) => !msg.parentId || !threadMessageIds.has(msg.parentId),
    );

    // Build simple tree for thread (without recursing into parse)
    return rootMessages.map((rootMsg) => {
      const idNode = this.buildIdNodeForThread(rootMsg, threadMessages);
      return this.transform(idNode);
    });
  }

  /**
   * Build IdNode structure for a thread message
   */
  private buildIdNodeForThread(message: Message, threadMessages: Message[]): IdNode {
    const children = threadMessages
      .filter((m) => m.parentId === message.id)
      .map((child) => this.buildIdNodeForThread(child, threadMessages));

    return {
      id: message.id,
      children,
    };
  }

  /**
   * Priority 3: Check if this is Assistant + Tools pattern
   */
  private isGroupNode(message: Message, idNode: IdNode): boolean {
    if (message.role !== 'assistant') {
      return false;
    }

    // All children must be tool messages
    return (
      idNode.children.length > 0 &&
      idNode.children.every((child) => {
        const childMsg = this.messageMap.get(child.id);
        return childMsg?.role === 'tool';
      })
    );
  }

  /**
   * Create GroupNode - assistant with tool calls
   */
  private createGroupNode(message: Message, idNode: IdNode): GroupNode {
    const tools: MessageNode[] = idNode.children.map((child) => {
      const toolMsg = this.messageMap.get(child.id)!;
      return {
        type: 'MESSAGE',
        id: this.generateNodeId('tool', child.id),
        messageId: child.id,
        children: [],
      };
    });

    return {
      type: 'GROUP',
      id: this.generateNodeId('group', message.id),
      assistantMessageId: message.id,
      tools,
    };
  }

  /**
   * Priority 4: Create BranchNode for multiple children
   */
  private createBranchNode(message: Message, idNode: IdNode): BranchNode {
    const branches = idNode.children.map((child) => {
      const childTree = this.transform(child);
      return [childTree];
    });

    return {
      type: 'BRANCH',
      id: this.generateNodeId('branch', message.id),
      parentMessageId: message.id,
      activeBranchIndex: 0, // Default to first branch
      branches,
    };
  }

  /**
   * Priority 5: Create basic MessageNode
   */
  private createMessageNode(message: Message, idNode: IdNode): MessageNode {
    const children = idNode.children.map((child) => this.transform(child));

    return {
      type: 'MESSAGE',
      id: this.generateNodeId('message', message.id),
      messageId: message.id,
      children,
    };
  }

  /**
   * Transform multiple IdNodes to DisplayNodes
   */
  transformAll(idNodes: IdNode[]): DisplayNode[] {
    return idNodes.map((node) => this.transform(node));
  }
}
