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
 * Converts structural idTree into semantic displayTree and flatList
 * Uses priority-based pattern matching to determine node types
 */
export class Transformer {
  private messageMap: Map<string, Message>;
  private messageGroupMap: Map<string, MessageGroupMetadata>;
  private nodeIdCounter = 0;

  constructor(private helperMaps: HelperMaps) {
    this.messageMap = helperMaps.messageMap;
    this.messageGroupMap = helperMaps.messageGroupMap;
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
  transform(idNode: IdNode): ContextNode {
    const message = this.messageMap.get(idNode.id);
    if (!message) {
      throw new Error(`Message not found: ${idNode.id}`);
    }

    // Priority 1: Explicit Compare instruction from metadata
    if (this.isCompareNode(message)) {
      return this.createCompareNode(message, idNode);
    }

    // Priority 2: Assistant + Tools aggregation (AssistantGroupNode)
    if (this.isAssistantGroupNode(message, idNode)) {
      return this.createAssistantGroupNode(message, idNode);
    }

    // Priority 3: Multiple children = Branch
    if (idNode.children.length > 1) {
      return this.createBranchNode(message, idNode);
    }

    // Priority 4: Default MessageNode
    return this.createMessageNode(message, idNode);
  }

  /**
   * Priority 1: Check if message has explicit compare mode
   */
  private isCompareNode(message: Message): boolean {
    return (message.metadata as any)?.presentation?.mode === 'compare';
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
      columns,
      id: this.generateNodeId('compare', message.id),
      messageId: message.id,
      type: 'compare',
    };
  }

  /**
   * Priority 2: Check if this is Assistant + Tools pattern
   */
  private isAssistantGroupNode(message: Message, idNode: IdNode): boolean {
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
   * Create AssistantGroupNode - assistant with tool calls
   */
  private createAssistantGroupNode(message: Message, idNode: IdNode): AssistantGroupNode {
    const tools: MessageNode[] = idNode.children.map((child) => ({
      children: [],
      id: this.generateNodeId('tool', child.id),
      messageId: child.id,
      type: 'message',
    }));

    return {
      assistantMessageId: message.id,
      id: this.generateNodeId('group', message.id),
      tools,
      type: 'assistantGroup',
    };
  }

  /**
   * Priority 3: Create BranchNode for multiple children
   */
  private createBranchNode(message: Message, idNode: IdNode): BranchNode {
    const branches = idNode.children.map((child) => {
      const childTree = this.transform(child);
      return [childTree];
    });

    return {
      activeBranchIndex: 0,
      // Default to first branch
branches,
      
id: this.generateNodeId('branch', message.id),
      
parentMessageId: message.id, 
      type: 'branch',
    };
  }

  /**
   * Priority 4: Create basic MessageNode
   */
  private createMessageNode(message: Message, idNode: IdNode): MessageNode {
    const children = idNode.children.map((child) => this.transform(child));

    return {
      children,
      id: this.generateNodeId('message', message.id),
      messageId: message.id,
      type: 'message',
    };
  }

  /**
   * Transform multiple IdNodes to DisplayNodes
   */
  transformAll(idNodes: IdNode[]): ContextNode[] {
    return idNodes.map((node) => this.transform(node));
  }

  /**
   * Generate flatList from messages array
   * Implements RFC priority-based pattern matching for flat rendering
   */
  flatten(messages: Message[]): Message[] {
    const flatList: Message[] = [];
    const processedIds = new Set<string>();
    const groupedMessageIds = new Map<string, Set<string>>();

    // Build message group membership map
    for (const msg of messages) {
      if (msg.groupId) {
        const members = groupedMessageIds.get(msg.groupId) || new Set();
        members.add(msg.id);
        groupedMessageIds.set(msg.groupId, members);
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Skip if already processed
      if (processedIds.has(message.id)) continue;

      // Priority 1a: Compare message group
      const messageGroup = message.groupId
        ? this.messageGroupMap.get(message.groupId)
        : undefined;

      if (messageGroup && messageGroup.mode === 'compare' && !processedIds.has(messageGroup.id)) {
        const groupMembers = this.collectGroupMembers(message.groupId!, messages);
        const compareMessage = this.createCompareMessage(messageGroup, groupMembers);
        flatList.push(compareMessage);
        groupMembers.forEach((m) => processedIds.add(m.id));
        processedIds.add(messageGroup.id);
        continue;
      }

      // Priority 1b: Generic message group (manual/summary)
      if (
        messageGroup &&
        messageGroup.mode !== 'compare' &&
        !processedIds.has(messageGroup.id)
      ) {
        const groupMembers = this.collectGroupMembers(message.groupId!, messages);
        const groupMessage = this.createMessageGroupMessage(messageGroup, groupMembers);
        flatList.push(groupMessage);
        groupMembers.forEach((m) => processedIds.add(m.id));
        processedIds.add(messageGroup.id);
        continue;
      }

      // Priority 2: AssistantGroup (assistant + tools)
      if (message.role === 'assistant' && message.tools && message.tools.length > 0) {
        const toolMessages = this.collectToolMessages(message, messages);
        const groupMessage = this.createAssistantGroupMessage(message, toolMessages);
        flatList.push(groupMessage);
        processedIds.add(message.id);
        toolMessages.forEach((m) => processedIds.add(m.id));
        continue;
      }

      // Priority 3: User message with branches
      if (message.role === 'user') {
        const branches = this.collectBranches(message, messages);
        if (branches.length > 1) {
          const userWithBranches = this.createUserMessageWithBranches(message, branches);
          flatList.push(userWithBranches);
          processedIds.add(message.id);
          continue;
        }
      }

      // Priority 4: Regular message
      flatList.push(message);
      processedIds.add(message.id);
    }

    return flatList;
  }

  /**
   * Collect all messages belonging to a message group
   */
  private collectGroupMembers(groupId: string, messages: Message[]): Message[] {
    return messages.filter((m) => m.groupId === groupId);
  }

  /**
   * Create compare virtual message
   */
  private createCompareMessage(
    group: MessageGroupMetadata,
    members: Message[],
  ): Message {
    // Create children as 2D array (columns x messages)
    const children: AssistantContentBlock[] = members.map((msg) =>
      this.messageToContentBlock(msg),
    );

    return {
      children,
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
   * Create generic message group virtual message
   */
  private createMessageGroupMessage(
    group: MessageGroupMetadata,
    members: Message[],
  ): Message {
    const children: AssistantContentBlock[] = members.map((msg) =>
      this.messageToContentBlock(msg),
    );

    return {
      children,
      content: group.title || '',
      createdAt: Math.min(...members.map((m) => m.createdAt)),
      extra: {
        description: group.description,
        groupMode: group.mode || 'manual',
      },
      id: group.id,
      meta: members[0]?.meta || {},
      role: 'messageGroup' as any,
      updatedAt: Math.max(...members.map((m) => m.updatedAt)),
    } as Message;
  }

  /**
   * Collect tool messages related to an assistant message
   */
  private collectToolMessages(assistant: Message, messages: Message[]): Message[] {
    const toolCallIds = new Set(assistant.tools?.map((t) => t.id) || []);
    return messages.filter((m) => m.role === 'tool' && m.tool_call_id && toolCallIds.has(m.tool_call_id));
  }

  /**
   * Create assistant group virtual message (assistant + tools aggregation)
   * Integrates logic from groupMessages.ts
   */
  private createAssistantGroupMessage(assistant: Message, toolMessages: Message[]): Message {
    const children: AssistantContentBlock[] = [];

    // Create tool map for lookup
    const toolMap = new Map<string, Message>();
    toolMessages.forEach((tm) => {
      if (tm.tool_call_id) {
        toolMap.set(tm.tool_call_id, tm);
      }
    });

    // First child: assistant with tool results
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
      imageList: assistant.imageList && assistant.imageList.length > 0 ? assistant.imageList : undefined,
      performance: msgPerformance,
      reasoning: assistant.reasoning || undefined,
      tools: toolsWithResults,
      usage: msgUsage,
    });

    // Aggregate usage and performance
    const aggregated = this.aggregateMetadata(children);

    return {
      ...assistant,
      children,
      content: '',
      
// Moved to children
imageList: undefined, 
      

// Tools moved to children
metadata: undefined,
      


performance: aggregated.performance,
      


// Cleared
reasoning: undefined, 
      


role: 'assistantGroup' as any, 
      


tools: undefined, 
      
// Content moved to children
usage: aggregated.usage, // Moved to children
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
      'inputCachedTokens',
      'inputCacheMissTokens',
      'inputWriteCacheTokens',
      'inputTextTokens',
      'inputImageTokens',
      'inputAudioTokens',
      'inputCitationTokens',
      'outputTextTokens',
      'outputImageTokens',
      'outputAudioTokens',
      'outputReasoningTokens',
      'acceptedPredictionTokens',
      'rejectedPredictionTokens',
      'totalInputTokens',
      'totalOutputTokens',
      'totalTokens',
      'cost',
    ] as const;

    let hasUsage = false;
    usageFields.forEach((field) => {
      if (metadata[field] !== undefined) {
        (usage as any)[field] = metadata[field];
        hasUsage = true;
      }
    });

    const performanceFields = ['tps', 'ttft', 'duration', 'latency'] as const;
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
          'inputCachedTokens',
          'inputCacheMissTokens',
          'inputWriteCacheTokens',
          'inputTextTokens',
          'inputImageTokens',
          'inputAudioTokens',
          'inputCitationTokens',
          'outputTextTokens',
          'outputImageTokens',
          'outputAudioTokens',
          'outputReasoningTokens',
          'acceptedPredictionTokens',
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

  /**
   * Collect branches for a parent message
   */
  private collectBranches(parent: Message, messages: Message[]): Message[] {
    return messages.filter((m) => m.parentId === parent.id);
  }

  /**
   * Create user message with branch metadata
   */
  private createUserMessageWithBranches(user: Message, branches: Message[]): Message {
    return {
      ...user,
      extra: {
        ...user.extra,
        branches: {
          count: branches.length,
          current: 0,
          items: branches.map((b) => ({
            createdAt: b.createdAt,
            id: b.id,
          })),
        },
      } as any,
    };
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
}
