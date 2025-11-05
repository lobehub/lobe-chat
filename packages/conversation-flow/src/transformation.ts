import type {
  AssistantContentBlock,
  ChatToolPayloadWithResult,
  ModelPerformance,
  ModelUsage,
} from '@lobechat/types';

import type {
  AssistantGroupNode,
  BranchNode,
  CompareNode,
  ContextNode,
  HelperMaps,
  IdNode,
  Message,
  MessageGroupMetadata,
  MessageNode,
} from './types';

/**
 * Phase 3: Transformation
 * Converts structural idTree into semantic contextTree and flatList
 */
export class Transformer {
  private messageMap: Map<string, Message>;
  private messageGroupMap: Map<string, MessageGroupMetadata>;
  private childrenMap: Map<string | null, string[]>;
  private nodeIdCounter = 0;

  constructor(private helperMaps: HelperMaps) {
    this.messageMap = helperMaps.messageMap;
    this.messageGroupMap = helperMaps.messageGroupMap;
    this.childrenMap = helperMaps.childrenMap;
  }

  /**
   * Generates a unique node ID
   */
  private generateNodeId(prefix: string, messageId: string): string {
    return `${prefix}-${messageId}-${this.nodeIdCounter++}`;
  }

  /**
   * Transform all root nodes to contextTree
   * Returns a linear array of context nodes
   */
  transformAll(idNodes: IdNode[]): ContextNode[] {
    const contextTree: ContextNode[] = [];

    for (const idNode of idNodes) {
      this.transformToLinear(idNode, contextTree);
    }

    return contextTree;
  }

  /**
   * Transform a single IdNode and append to contextTree array
   */
  private transformToLinear(idNode: IdNode, contextTree: ContextNode[]): void {
    const message = this.messageMap.get(idNode.id);
    if (!message) return;

    // Priority 1: Compare mode from user message metadata
    if (this.isCompareMode(message) && idNode.children.length > 1) {
      // Add user message node
      const messageNode = this.createMessageNode(message);
      contextTree.push(messageNode);

      // Create compare node with children
      const compareNode = this.createCompareNodeFromChildren(message, idNode);
      contextTree.push(compareNode);

      // Don't continue after compare - compare is an end point
      return;
    }

    // Priority 2: Compare mode (from messageGroup metadata)
    const messageGroup = message.groupId ? this.messageGroupMap.get(message.groupId) : undefined;

    if (messageGroup && messageGroup.mode === 'compare') {
      // Create compare node
      const compareNode = this.createCompareNode(messageGroup, message);
      contextTree.push(compareNode);

      // Don't process children as they're handled by compare
      return;
    }

    // Priority 3: AssistantGroup (assistant + tools)
    if (this.isAssistantGroupNode(message, idNode)) {
      const assistantGroupNode = this.createAssistantGroupNode(message, idNode);
      contextTree.push(assistantGroupNode);

      // Find the next message after tools
      const nextMessage = this.findNextAfterTools(message, idNode);
      if (nextMessage) {
        this.transformToLinear(nextMessage, contextTree);
      }
      return;
    }

    // Priority 4: Branch (multiple children)
    if (idNode.children.length > 1) {
      // Add current message node
      const messageNode = this.createMessageNode(message);
      contextTree.push(messageNode);

      // Create branch node
      const branchNode = this.createBranchNode(message, idNode);
      contextTree.push(branchNode);

      // Don't continue after branch - branch is an end point
      return;
    }

    // Priority 5: Regular message
    const messageNode = this.createMessageNode(message);
    contextTree.push(messageNode);

    // Continue with single child
    if (idNode.children.length === 1) {
      this.transformToLinear(idNode.children[0], contextTree);
    }
  }

  /**
   * Check if message has compare mode in metadata
   */
  private isCompareMode(message: Message): boolean {
    return (message.metadata as any)?.compare === true;
  }

  /**
   * Create CompareNode from children messages
   */
  private createCompareNodeFromChildren(message: Message, idNode: IdNode): CompareNode {
    // Find active column ID from children metadata
    let activeColumnId: string | undefined;

    // Each child is a column - need to recursively process to handle AssistantGroup
    const columns = idNode.children.map((child) => {
      const childMessage = this.messageMap.get(child.id);
      if (!childMessage) {
        return [
          {
            id: child.id,
            type: 'message',
          } as MessageNode,
        ];
      }

      // Check if this message is marked as active column
      if ((childMessage.metadata as any)?.activeColumn === true) {
        activeColumnId = child.id;
      }

      // Check if this column should be an AssistantGroup
      if (this.isAssistantGroupNode(childMessage, child)) {
        const assistantGroupNode = this.createAssistantGroupNode(childMessage, child);
        return [assistantGroupNode];
      }

      // Otherwise, just a simple MessageNode
      return [
        {
          id: child.id,
          type: 'message',
        } as MessageNode,
      ];
    });

    // Generate ID by joining parent message id and all column message ids
    const columnIds = idNode.children.map((child) => child.id).join('-');
    const compareId = `compare-${message.id}-${columnIds}`;

    return {
      activeColumnId,
      columns,
      id: compareId,
      messageId: message.id,
      type: 'compare',
    };
  }

  /**
   * Check if this is Assistant + Tools pattern
   */
  private isAssistantGroupNode(message: Message, idNode: IdNode): boolean {
    if (message.role !== 'assistant') return false;

    return (
      idNode.children.length > 0 &&
      idNode.children.every((child) => {
        const childMsg = this.messageMap.get(child.id);
        return childMsg?.role === 'tool';
      })
    );
  }

  /**
   * Find next message after the entire AssistantGroup
   */
  private findNextAfterTools(assistantMsg: Message, idNode: IdNode): IdNode | null {
    // Recursively find the last message in the assistant group
    const lastNode = this.findLastNodeInAssistantGroup(idNode);
    if (lastNode && lastNode.children.length > 0) {
      return lastNode.children[0];
    }
    return null;
  }

  /**
   * Find the last node in an AssistantGroup sequence
   */
  private findLastNodeInAssistantGroup(idNode: IdNode): IdNode | null {
    // Check if has tool children
    const toolChildren = idNode.children.filter((child) => {
      const childMsg = this.messageMap.get(child.id);
      return childMsg?.role === 'tool';
    });

    if (toolChildren.length === 0) {
      return idNode;
    }

    // Check if any tool has an assistant child
    for (const toolNode of toolChildren) {
      if (toolNode.children.length > 0) {
        const nextChild = toolNode.children[0];
        const nextMsg = this.messageMap.get(nextChild.id);

        if (nextMsg?.role === 'assistant') {
          // Continue following the assistant chain
          return this.findLastNodeInAssistantGroup(nextChild);
        }
      }
    }

    // No more assistant messages, return the last tool node
    return toolChildren.at(-1) ?? null;
  }

  /**
   * Get active branch ID from message metadata or infer from children
   */
  private getActiveBranchId(message: Message, idNode: IdNode): string {
    // Try to get from metadata
    const activeBranchId = (message.metadata as any)?.activeBranchId;
    if (activeBranchId) return activeBranchId;

    // Infer from which branch has children
    for (const child of idNode.children) {
      if (child.children.length > 0) {
        return child.id;
      }
    }

    // Default to first branch
    return idNode.children[0].id;
  }

  /**
   * Create MessageNode (leaf node)
   * Uses the message's own id directly
   */
  private createMessageNode(message: Message): MessageNode {
    return {
      id: message.id,
      type: 'message',
    };
  }

  /**
   * Create AssistantGroupNode
   * Collects all assistant messages in the sequence (with or without tools)
   */
  private createAssistantGroupNode(message: Message, idNode: IdNode): AssistantGroupNode {
    const children: ContextNode[] = [];

    // Recursively collect all assistant messages in this group
    this.collectAssistantGroupMessages(message, idNode, children);

    return {
      children,
      id: message.id,
      type: 'assistantGroup',
    };
  }

  /**
   * Recursively collect assistant messages for an AssistantGroup
   */
  private collectAssistantGroupMessages(
    message: Message,
    idNode: IdNode,
    children: ContextNode[],
  ): void {
    // Get tool message IDs if this assistant has tools
    const toolIds = idNode.children
      .filter((child) => {
        const childMsg = this.messageMap.get(child.id);
        return childMsg?.role === 'tool';
      })
      .map((child) => child.id);

    // Add current assistant message node
    const messageNode: MessageNode = {
      id: message.id,
      type: 'message',
    };
    if (toolIds.length > 0) {
      messageNode.tools = toolIds;
    }
    children.push(messageNode);

    // Find next assistant message after tools
    for (const toolNode of idNode.children) {
      const toolMsg = this.messageMap.get(toolNode.id);
      if (toolMsg?.role !== 'tool') continue;

      // Check if tool has an assistant child
      if (toolNode.children.length > 0) {
        const nextChild = toolNode.children[0];
        const nextMsg = this.messageMap.get(nextChild.id);

        if (nextMsg?.role === 'assistant') {
          // Recursively collect this assistant and its descendants
          this.collectAssistantGroupMessages(nextMsg, nextChild, children);
          return; // Only follow one path
        }
      }
    }
  }

  /**
   * Create BranchNode
   */
  private createBranchNode(message: Message, idNode: IdNode): BranchNode {
    const activeBranchId = this.getActiveBranchId(message, idNode);
    const activeBranchIndex = idNode.children.findIndex((child) => child.id === activeBranchId);

    // Each branch is a tree starting from that child
    const branches = idNode.children.map((child) => {
      const branchTree: ContextNode[] = [];
      this.transformToLinear(child, branchTree);
      return branchTree;
    });

    return {
      activeBranchIndex: activeBranchIndex >= 0 ? activeBranchIndex : 0,
      branches,
      id: this.generateNodeId('branch', message.id),
      parentMessageId: message.id,
      type: 'branch',
    };
  }

  /**
   * Create CompareNode from message group
   */
  private createCompareNode(group: MessageGroupMetadata, message: Message): CompareNode {
    // Collect all messages in this group
    const groupMessages: Message[] = [];
    for (const msg of this.messageMap.values()) {
      if (msg.groupId === group.id) {
        groupMessages.push(msg);
      }
    }

    // Find active column ID from group messages metadata
    const activeColumnId = groupMessages.find(
      (msg) => (msg.metadata as any)?.activeColumn === true,
    )?.id;

    // Each column is a message tree
    const columns = groupMessages.map((msg) => {
      const messageNode: MessageNode = {
        id: msg.id,
        type: 'message',
      };
      return [messageNode];
    });

    return {
      activeColumnId,
      columns,
      id: this.generateNodeId('compare', group.id),
      messageId: group.parentMessageId || message.id,
      type: 'compare',
    };
  }

  /**
   * Generate flatList from messages array
   * Only includes messages in the active path
   */
  flatten(messages: Message[]): Message[] {
    const flatList: Message[] = [];
    const processedIds = new Set<string>();

    // Build the active path by traversing from root
    this.buildFlatListRecursive(null, flatList, processedIds, messages);

    return flatList;
  }

  /**
   * Recursively build flatList following the active path
   */
  private buildFlatListRecursive(
    parentId: string | null,
    flatList: Message[],
    processedIds: Set<string>,
    allMessages: Message[],
  ): void {
    const children = this.childrenMap.get(parentId) ?? [];

    for (const childId of children) {
      if (processedIds.has(childId)) continue;

      const message = this.messageMap.get(childId);
      if (!message) continue;

      // Priority 1: Compare message group
      const messageGroup = message.groupId ? this.messageGroupMap.get(message.groupId) : undefined;

      if (messageGroup && messageGroup.mode === 'compare' && !processedIds.has(messageGroup.id)) {
        const groupMembers = this.collectGroupMembers(message.groupId!, allMessages);
        const compareMessage = this.createCompareMessage(messageGroup, groupMembers);
        flatList.push(compareMessage);
        groupMembers.forEach((m) => processedIds.add(m.id));
        processedIds.add(messageGroup.id);
        continue;
      }

      // Priority 2: AssistantGroup (assistant + tools)
      if (message.role === 'assistant' && message.tools && message.tools.length > 0) {
        // Collect the entire assistant group chain
        const assistantChain: Message[] = [];
        const allToolMessages: Message[] = [];
        this.collectAssistantChain(
          message,
          allMessages,
          assistantChain,
          allToolMessages,
          processedIds,
        );

        // Create assistantGroup virtual message
        const groupMessage = this.createAssistantGroupMessage(
          assistantChain[0],
          assistantChain,
          allToolMessages,
        );
        flatList.push(groupMessage);

        // Mark all as processed
        assistantChain.forEach((m) => processedIds.add(m.id));
        allToolMessages.forEach((m) => processedIds.add(m.id));

        // Continue after the last tool message
        const lastToolMsg = allToolMessages.at(-1);
        if (lastToolMsg) {
          this.buildFlatListRecursive(lastToolMsg.id, flatList, processedIds, allMessages);
        }
        continue;
      }

      // Priority 3a: Compare mode from user message metadata
      const childMessages = this.childrenMap.get(message.id) ?? [];
      if (this.isCompareMode(message) && childMessages.length > 1) {
        // Add user message
        flatList.push(message);
        processedIds.add(message.id);

        // Create compare virtual message with proper handling of AssistantGroups
        const compareMessage = this.createCompareMessageFromChildIds(
          message,
          childMessages,
          allMessages,
          processedIds,
        );
        flatList.push(compareMessage);

        // Don't continue after compare
        continue;
      }

      // Priority 3b: User message with branches
      if (message.role === 'user' && childMessages.length > 1) {
        const activeBranchId = this.getActiveBranchIdFromMetadata(message, childMessages);
        const userWithBranches = this.createUserMessageWithBranches(message);
        flatList.push(userWithBranches);
        processedIds.add(message.id);

        // Continue with active branch and process its message
        const activeBranchMsg = this.messageMap.get(activeBranchId);
        if (activeBranchMsg) {
          flatList.push(activeBranchMsg);
          processedIds.add(activeBranchId);

          // Continue with active branch's children
          this.buildFlatListRecursive(activeBranchId, flatList, processedIds, allMessages);
        }
        continue;
      }

      // Priority 4: Regular message
      flatList.push(message);
      processedIds.add(message.id);

      // Continue with children
      this.buildFlatListRecursive(message.id, flatList, processedIds, allMessages);
    }
  }

  /**
   * Get active branch ID from message metadata or infer
   */
  private getActiveBranchIdFromMetadata(message: Message, childIds: string[]): string {
    const activeBranchId = (message.metadata as any)?.activeBranchId;
    if (activeBranchId && childIds.includes(activeBranchId)) {
      return activeBranchId;
    }

    // Infer from which child has descendants
    for (const childId of childIds) {
      const descendants = this.childrenMap.get(childId);
      if (descendants && descendants.length > 0) {
        return childId;
      }
    }

    // Default to first child
    return childIds[0];
  }

  /**
   * Collect all messages belonging to a message group
   */
  private collectGroupMembers(groupId: string, messages: Message[]): Message[] {
    return messages.filter((m) => m.groupId === groupId);
  }

  /**
   * Collect tool messages related to an assistant message
   */
  private collectToolMessages(assistant: Message, messages: Message[]): Message[] {
    const toolCallIds = new Set(assistant.tools?.map((t) => t.id) || []);
    return messages.filter(
      (m) => m.role === 'tool' && m.tool_call_id && toolCallIds.has(m.tool_call_id),
    );
  }

  /**
   * Recursively collect the entire assistant chain (assistant -> tools -> assistant -> tools -> ...)
   */
  private collectAssistantChain(
    currentAssistant: Message,
    allMessages: Message[],
    assistantChain: Message[],
    allToolMessages: Message[],
    processedIds: Set<string>,
  ): void {
    if (processedIds.has(currentAssistant.id)) return;

    // Add current assistant to chain
    assistantChain.push(currentAssistant);

    // Collect its tool messages
    const toolMessages = this.collectToolMessages(currentAssistant, allMessages);
    allToolMessages.push(...toolMessages);

    // Find next assistant after tools
    for (const toolMsg of toolMessages) {
      const nextMessages = allMessages.filter((m) => m.parentId === toolMsg.id);

      for (const nextMsg of nextMessages) {
        if (nextMsg.role === 'assistant' && nextMsg.tools && nextMsg.tools.length > 0) {
          // Continue the chain
          this.collectAssistantChain(
            nextMsg,
            allMessages,
            assistantChain,
            allToolMessages,
            processedIds,
          );
          return;
        } else if (nextMsg.role === 'assistant') {
          // Final assistant without tools
          assistantChain.push(nextMsg);
          return;
        }
      }
    }
  }

  /**
   * Create compare virtual message from children (for metadata-based compare)
   */
  /**
   * Create compare virtual message from child IDs with AssistantGroup support
   */
  private createCompareMessageFromChildIds(
    parentMessage: Message,
    childIds: string[],
    allMessages: Message[],
    processedIds: Set<string>,
  ): Message {
    const columns: ContextNode[][] = [];
    const children: AssistantContentBlock[] = [];
    const columnFirstIds: string[] = [];
    let activeColumnId: string | undefined;

    // Process each child (column)
    for (const childId of childIds) {
      const childMessage = this.messageMap.get(childId);
      if (!childMessage) continue;

      columnFirstIds.push(childId);

      // Check if this message is marked as active column
      if ((childMessage.metadata as any)?.activeColumn === true) {
        activeColumnId = childId;
      }

      // Check if this child is an AssistantGroup
      if (
        childMessage.role === 'assistant' &&
        childMessage.tools &&
        childMessage.tools.length > 0
      ) {
        // Collect the entire assistant group chain for this column
        const assistantChain: Message[] = [];
        const allToolMessages: Message[] = [];
        const columnProcessedIds = new Set<string>();

        this.collectAssistantChain(
          childMessage,
          allMessages,
          assistantChain,
          allToolMessages,
          columnProcessedIds,
        );

        // Create column with AssistantGroup structure
        const assistantGroupChildren: ContextNode[] = [];

        // Build children MessageNodes for each assistant in the chain
        for (const assistant of assistantChain) {
          const toolIds = allToolMessages
            .filter((tm) => tm.parentId === assistant.id)
            .map((tm) => tm.id);

          const messageNode: MessageNode = {
            id: assistant.id,
            type: 'message',
          };

          if (toolIds.length > 0) {
            messageNode.tools = toolIds;
          }

          assistantGroupChildren.push(messageNode);
        }

        const assistantGroupColumn: AssistantGroupNode = {
          children: assistantGroupChildren,
          id: childMessage.id,
          type: 'assistantGroup',
        };

        columns.push([assistantGroupColumn]);

        // Add all assistant messages as content blocks to children array
        for (const assistant of assistantChain) {
          const toolsWithResults: ChatToolPayloadWithResult[] =
            assistant.tools?.map((tool) => {
              const toolMsg = allToolMessages.find((tm) => tm.tool_call_id === tool.id);
              if (toolMsg) {
                return {
                  ...tool,
                  result: {
                    content: toolMsg.content || '',
                    error: toolMsg.error,
                    id: toolMsg.id,
                    state: toolMsg.pluginState,
                  },
                  result_msg_id: toolMsg.id,
                };
              }
              return tool;
            }) || [];

          const { usage: msgUsage, performance: msgPerformance } = this.splitMetadata(
            assistant.metadata,
          );

          children.push({
            content: assistant.content || '',
            error: assistant.error,
            id: assistant.id,
            imageList:
              assistant.imageList && assistant.imageList.length > 0
                ? assistant.imageList
                : undefined,
            performance: msgPerformance,
            reasoning: assistant.reasoning || undefined,
            tools: toolsWithResults.length > 0 ? toolsWithResults : undefined,
            usage: msgUsage,
          });
        }

        // Mark all as processed
        assistantChain.forEach((m) => processedIds.add(m.id));
        allToolMessages.forEach((m) => processedIds.add(m.id));
      } else {
        // Regular message (not an AssistantGroup)
        columns.push([
          {
            id: childId,
            type: 'message',
          },
        ]);
        children.push(this.messageToContentBlock(childMessage));
        processedIds.add(childId);
      }
    }

    // Generate ID with all column first message IDs
    const columnIdsStr = columnFirstIds.join('-');
    const compareId = `compare-${parentMessage.id}-${columnIdsStr}`;

    // Calculate timestamps from first column's messages
    const firstColumnMessages = childIds.map((id) => this.messageMap.get(id)).filter(Boolean);
    const createdAt =
      firstColumnMessages.length > 0
        ? Math.min(...firstColumnMessages.map((m) => m!.createdAt))
        : parentMessage.createdAt;
    const updatedAt =
      firstColumnMessages.length > 0
        ? Math.max(...firstColumnMessages.map((m) => m!.updatedAt))
        : parentMessage.updatedAt;

    return {
      activeColumnId,
      children,
      columns: columns as any,
      content: '',
      createdAt,
      extra: {
        parentMessageId: parentMessage.id,
      },
      id: compareId,
      meta: parentMessage.meta || {},
      role: 'compare' as any,
      updatedAt,
    } as Message;
  }

  private createCompareMessageFromChildren(parentMessage: Message, children: Message[]): Message {
    // Create columns similar to contextTree
    const columns: ContextNode[][] = children.map((msg) => [
      {
        id: msg.id,
        type: 'message',
      },
    ]);

    return {
      children: children.map((msg) => this.messageToContentBlock(msg)),
      columns: columns as any,
      content: '',
      createdAt: Math.min(...children.map((m) => m.createdAt)),
      extra: {
        parentMessageId: parentMessage.id,
      },
      id: `compare-${parentMessage.id}`,
      meta: children[0]?.meta || {},
      role: 'compare' as any,
      updatedAt: Math.max(...children.map((m) => m.updatedAt)),
    } as Message;
  }

  /**
   * Create compare virtual message (for group-based compare)
   */
  private createCompareMessage(group: MessageGroupMetadata, members: Message[]): Message {
    // Find active column ID from members metadata
    const activeColumnId = members.find((msg) => (msg.metadata as any)?.activeColumn === true)?.id;

    // Create columns similar to contextTree
    const columns: ContextNode[][] = members.map((msg) => [
      {
        id: msg.id,
        type: 'message',
      },
    ]);

    return {
      activeColumnId,
      children: members.map((msg) => this.messageToContentBlock(msg)),
      columns: columns as any,
      content: '',
      createdAt: Math.min(...members.map((m) => m.createdAt)),
      extra: {
        groupMode: group.mode,
        parentMessageId: group.parentMessageId,
      },
      id: group.id,
      meta: members[0]?.meta || {},
      role: 'compare' as any,
      updatedAt: Math.max(...members.map((m) => m.updatedAt)),
    } as Message;
  }

  /**
   * Create assistant group virtual message from entire chain
   */
  private createAssistantGroupMessage(
    firstAssistant: Message,
    assistantChain: Message[],
    allToolMessages: Message[],
  ): Message {
    const children: AssistantContentBlock[] = [];

    // Create tool map for lookup
    const toolMap = new Map<string, Message>();
    allToolMessages.forEach((tm) => {
      if (tm.tool_call_id) {
        toolMap.set(tm.tool_call_id, tm);
      }
    });

    // Process each assistant in the chain
    for (const assistant of assistantChain) {
      // Build toolsWithResults for this assistant
      const toolsWithResults: ChatToolPayloadWithResult[] =
        assistant.tools?.map((tool) => {
          const toolMsg = toolMap.get(tool.id);
          if (toolMsg) {
            return {
              ...tool,
              result: {
                content: toolMsg.content || '',
                error: toolMsg.error,
                id: toolMsg.id,
                state: toolMsg.pluginState,
              },
              result_msg_id: toolMsg.id,
            };
          }
          return tool;
        }) || [];

      const { usage: msgUsage, performance: msgPerformance } = this.splitMetadata(
        assistant.metadata,
      );

      children.push({
        content: assistant.content || '',
        error: assistant.error,
        id: assistant.id,
        imageList:
          assistant.imageList && assistant.imageList.length > 0 ? assistant.imageList : undefined,
        performance: msgPerformance,
        reasoning: assistant.reasoning || undefined,
        tools: toolsWithResults.length > 0 ? toolsWithResults : undefined,
        usage: msgUsage,
      });
    }

    const aggregated = this.aggregateMetadata(children);

    return {
      ...firstAssistant,
      children,
      content: '',
      imageList: undefined,
      metadata: undefined,
      performance: aggregated.performance,
      reasoning: undefined,
      role: 'assistantGroup' as any,
      tools: undefined,
      usage: aggregated.usage,
    };
  }

  /**
   * Create user message with branch metadata
   */
  private createUserMessageWithBranches(user: Message): Message {
    // Just return the original user message with its metadata.activeBranchId
    // No need to add extra.branches
    return { ...user };
  }

  /**
   * Convert Message to AssistantContentBlock
   */
  private messageToContentBlock(message: Message): AssistantContentBlock {
    const { usage, performance } = this.splitMetadata(message.metadata);

    return {
      content: message.content || '',
      error: message.error,
      id: message.id,
      imageList: message.imageList,
      performance,
      reasoning: message.reasoning || undefined,
      tools: message.tools as any,
      usage,
    };
  }

  /**
   * Split metadata into usage and performance
   */
  private splitMetadata(metadata?: any): {
    performance?: ModelPerformance;
    usage?: ModelUsage;
  } {
    if (!metadata) return {};

    const usage: ModelUsage = {};
    const performance: ModelPerformance = {};

    const usageFields = [
      'acceptedPredictionTokens',
      'cost',
      'inputAudioTokens',
      'inputCacheMissTokens',
      'inputCachedTokens',
      'inputCitationTokens',
      'inputImageTokens',
      'inputTextTokens',
      'inputWriteCacheTokens',
      'outputAudioTokens',
      'outputImageTokens',
      'outputReasoningTokens',
      'outputTextTokens',
      'rejectedPredictionTokens',
      'totalInputTokens',
      'totalOutputTokens',
      'totalTokens',
    ] as const;

    let hasUsage = false;
    usageFields.forEach((field) => {
      if (metadata[field] !== undefined) {
        (usage as any)[field] = metadata[field];
        hasUsage = true;
      }
    });

    const performanceFields = ['duration', 'latency', 'tps', 'ttft'] as const;
    let hasPerformance = false;
    performanceFields.forEach((field) => {
      if (metadata[field] !== undefined) {
        (performance as any)[field] = metadata[field];
        hasPerformance = true;
      }
    });

    return {
      performance: hasPerformance ? performance : undefined,
      usage: hasUsage ? usage : undefined,
    };
  }

  /**
   * Aggregate metadata from children
   */
  private aggregateMetadata(children: AssistantContentBlock[]): {
    performance?: ModelPerformance;
    usage?: ModelUsage;
  } {
    const usage: ModelUsage = {};
    const performance: ModelPerformance = {};
    let hasUsageData = false;
    let hasPerformanceData = false;
    let tpsSum = 0;
    let tpsCount = 0;

    children.forEach((child) => {
      if (child.usage) {
        const tokenFields = [
          'acceptedPredictionTokens',
          'inputAudioTokens',
          'inputCacheMissTokens',
          'inputCachedTokens',
          'inputCitationTokens',
          'inputImageTokens',
          'inputTextTokens',
          'inputWriteCacheTokens',
          'outputAudioTokens',
          'outputImageTokens',
          'outputReasoningTokens',
          'outputTextTokens',
          'rejectedPredictionTokens',
          'totalInputTokens',
          'totalOutputTokens',
          'totalTokens',
        ] as const;

        tokenFields.forEach((field) => {
          if (typeof child.usage![field] === 'number') {
            (usage as any)[field] = ((usage as any)[field] || 0) + child.usage![field]!;
            hasUsageData = true;
          }
        });

        if (typeof child.usage.cost === 'number') {
          usage.cost = (usage.cost || 0) + child.usage.cost;
          hasUsageData = true;
        }
      }

      if (child.performance) {
        if (child.performance.ttft !== undefined && performance.ttft === undefined) {
          performance.ttft = child.performance.ttft;
          hasPerformanceData = true;
        }
        if (typeof child.performance.tps === 'number') {
          tpsSum += child.performance.tps;
          tpsCount += 1;
          hasPerformanceData = true;
        }
        if (child.performance.duration !== undefined) {
          performance.duration = (performance.duration || 0) + child.performance.duration;
          hasPerformanceData = true;
        }
        if (child.performance.latency !== undefined) {
          performance.latency = (performance.latency || 0) + child.performance.latency;
          hasPerformanceData = true;
        }
      }
    });

    if (tpsCount > 0) {
      performance.tps = tpsSum / tpsCount;
    }

    return {
      performance: hasPerformanceData ? performance : undefined,
      usage: hasUsageData ? usage : undefined,
    };
  }
}
