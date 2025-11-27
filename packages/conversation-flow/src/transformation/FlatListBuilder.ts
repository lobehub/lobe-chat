import type { AssistantContentBlock, ChatToolPayloadWithResult } from '@lobechat/types';

import type { Message, MessageGroupMetadata } from '../types';
import type { BranchResolver } from './BranchResolver';
import type { MessageCollector } from './MessageCollector';
import type { MessageTransformer } from './MessageTransformer';

/**
 * FlatListBuilder - Builds flat message list following the active path
 *
 * Handles:
 * 1. Recursive traversal following active branches
 * 2. Creating virtual messages for Compare and AssistantGroup
 * 3. Processing different message types with priority
 */
export class FlatListBuilder {
  constructor(
    private messageMap: Map<string, Message>,
    private messageGroupMap: Map<string, MessageGroupMetadata>,
    private childrenMap: Map<string | null, string[]>,
    private branchResolver: BranchResolver,
    private messageCollector: MessageCollector,
    private messageTransformer: MessageTransformer,
  ) {}

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
        const groupMembers = this.messageCollector.collectGroupMembers(
          message.groupId!,
          allMessages,
        );
        const compareMessage = this.createCompareMessage(messageGroup, groupMembers);
        flatList.push(compareMessage);
        groupMembers.forEach((m) => processedIds.add(m.id));
        processedIds.add(messageGroup.id);

        // Continue with active column's children (if any)
        if ((compareMessage as any).activeColumnId) {
          this.buildFlatListRecursive(
            (compareMessage as any).activeColumnId,
            flatList,
            processedIds,
            allMessages,
          );
        }
        continue;
      }

      // Priority 2: AssistantGroup (assistant + tools)
      if (message.role === 'assistant' && message.tools && message.tools.length > 0) {
        // Collect the entire assistant group chain
        const assistantChain: Message[] = [];
        const allToolMessages: Message[] = [];
        this.messageCollector.collectAssistantChain(
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

        // Continue after the assistant chain
        // Priority 1: If last assistant has non-tool children, continue from it
        // Priority 2: Otherwise continue from tools (for cases where user replies to tool)
        const lastAssistant = assistantChain.at(-1);
        const toolIds = new Set(allToolMessages.map((t) => t.id));

        const lastAssistantNonToolChildren = lastAssistant
          ? this.childrenMap.get(lastAssistant.id)?.filter((childId) => !toolIds.has(childId))
          : undefined;

        if (
          lastAssistantNonToolChildren &&
          lastAssistantNonToolChildren.length > 0 &&
          lastAssistant
        ) {
          // Follow-up messages exist after the last assistant (not tools)
          this.buildFlatListRecursive(lastAssistant.id, flatList, processedIds, allMessages);
        } else {
          // No non-tool children of last assistant, check tools for children
          for (const toolMsg of allToolMessages) {
            this.buildFlatListRecursive(toolMsg.id, flatList, processedIds, allMessages);
          }
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

        // Continue with active column's children (if any)
        if ((compareMessage as any).activeColumnId) {
          this.buildFlatListRecursive(
            (compareMessage as any).activeColumnId,
            flatList,
            processedIds,
            allMessages,
          );
        }
        continue;
      }

      // Priority 3b: User message with branches
      if (message.role === 'user' && childMessages.length > 1) {
        const activeBranchId = this.branchResolver.getActiveBranchIdFromMetadata(
          message,
          childMessages,
          this.childrenMap,
        );
        const activeBranchIndex = childMessages.indexOf(activeBranchId);
        const userWithBranches = this.createUserMessageWithBranches(
          message,
          childMessages.length,
          activeBranchIndex,
        );
        flatList.push(userWithBranches);
        processedIds.add(message.id);

        // Continue with active branch - check if it's an assistantGroup
        const activeBranchMsg = this.messageMap.get(activeBranchId);
        if (activeBranchMsg) {
          // Check if active branch is assistant with tools (should be assistantGroup)
          if (
            activeBranchMsg.role === 'assistant' &&
            activeBranchMsg.tools &&
            activeBranchMsg.tools.length > 0
          ) {
            // Collect the entire assistant group chain
            const assistantChain: Message[] = [];
            const allToolMessages: Message[] = [];
            this.messageCollector.collectAssistantChain(
              activeBranchMsg,
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

            // Continue after the assistant chain
            const lastAssistant = assistantChain.at(-1);
            const toolIds = new Set(allToolMessages.map((t) => t.id));

            const lastAssistantNonToolChildren = lastAssistant
              ? this.childrenMap.get(lastAssistant.id)?.filter((childId) => !toolIds.has(childId))
              : undefined;

            if (
              lastAssistantNonToolChildren &&
              lastAssistantNonToolChildren.length > 0 &&
              lastAssistant
            ) {
              this.buildFlatListRecursive(lastAssistant.id, flatList, processedIds, allMessages);
            } else {
              for (const toolMsg of allToolMessages) {
                this.buildFlatListRecursive(toolMsg.id, flatList, processedIds, allMessages);
              }
            }
          } else {
            // Regular message (not assistantGroup)
            flatList.push(activeBranchMsg);
            processedIds.add(activeBranchId);

            // Continue with active branch's children
            this.buildFlatListRecursive(activeBranchId, flatList, processedIds, allMessages);
          }
        }
        continue;
      }

      // Priority 3c: Assistant message with branches
      if (message.role === 'assistant' && childMessages.length > 1) {
        const activeBranchId = this.branchResolver.getActiveBranchIdFromMetadata(
          message,
          childMessages,
          this.childrenMap,
        );
        // Add the assistant message itself
        flatList.push(message);
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
   * Check if message has compare mode in metadata
   */
  private isCompareMode(message: Message): boolean {
    return (message.metadata as any)?.compare === true;
  }

  /**
   * Create compare virtual message from child IDs with AssistantGroup support
   */
  private createCompareMessageFromChildIds(
    parentMessage: Message,
    childIds: string[],
    allMessages: Message[],
    processedIds: Set<string>,
  ): Message {
    const columns: Message[][] = [];
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

        this.messageCollector.collectAssistantChain(
          childMessage,
          allMessages,
          assistantChain,
          allToolMessages,
          columnProcessedIds,
        );

        // Create assistantGroup virtual message for this column
        const groupMessage = this.createAssistantGroupMessage(
          assistantChain[0],
          assistantChain,
          allToolMessages,
        );

        columns.push([groupMessage]);

        // Mark all as processed
        assistantChain.forEach((m) => processedIds.add(m.id));
        allToolMessages.forEach((m) => processedIds.add(m.id));
      } else {
        // Regular message (not an AssistantGroup)
        columns.push([childMessage]);
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

  /**
   * Create compare virtual message (for group-based compare)
   */
  private createCompareMessage(group: MessageGroupMetadata, members: Message[]): Message {
    // Find active column ID from members metadata
    const activeColumnId = members.find((msg) => (msg.metadata as any)?.activeColumn === true)?.id;

    // columns contain full Message objects
    const columns: Message[][] = members.map((msg) => [msg]);

    return {
      activeColumnId,
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
            const result: any = {
              content: toolMsg.content || '',
              id: toolMsg.id,
            };
            if (toolMsg.error) result.error = toolMsg.error;
            if (toolMsg.pluginState) result.state = toolMsg.pluginState;

            const toolWithResult: ChatToolPayloadWithResult = {
              ...tool,
              intervention: toolMsg.pluginIntervention,
              result,
              result_msg_id: toolMsg.id,
            };

            return toolWithResult;
          }
          return tool;
        }) || [];

      // Prefer top-level usage/performance fields, fall back to metadata
      const { usage: metaUsage, performance: metaPerformance } =
        this.messageTransformer.splitMetadata(assistant.metadata);
      const msgUsage = assistant.usage || metaUsage;
      const msgPerformance = assistant.performance || metaPerformance;

      // Extract non-usage/performance metadata fields
      const otherMetadata: Record<string, any> = {};
      if (assistant.metadata) {
        const usagePerformanceFields = new Set([
          'acceptedPredictionTokens',
          'cost',
          'duration',
          'inputAudioTokens',
          'inputCacheMissTokens',
          'inputCachedTokens',
          'inputCitationTokens',
          'inputImageTokens',
          'inputTextTokens',
          'inputWriteCacheTokens',
          'latency',
          'outputAudioTokens',
          'outputImageTokens',
          'outputReasoningTokens',
          'outputTextTokens',
          'rejectedPredictionTokens',
          'totalInputTokens',
          'totalOutputTokens',
          'totalTokens',
          'tps',
          'ttft',
        ]);

        Object.entries(assistant.metadata).forEach(([key, value]) => {
          if (!usagePerformanceFields.has(key)) {
            otherMetadata[key] = value;
          }
        });
      }

      const childBlock: AssistantContentBlock = {
        content: assistant.content || '',
        id: assistant.id,
      } as AssistantContentBlock;

      if (assistant.error) childBlock.error = assistant.error;
      if (assistant.imageList && assistant.imageList.length > 0)
        childBlock.imageList = assistant.imageList;
      if (msgPerformance) childBlock.performance = msgPerformance;
      if (assistant.reasoning) childBlock.reasoning = assistant.reasoning;
      if (toolsWithResults.length > 0) childBlock.tools = toolsWithResults;
      if (msgUsage) childBlock.usage = msgUsage;
      if (Object.keys(otherMetadata).length > 0) {
        childBlock.metadata = otherMetadata;
      }

      children.push(childBlock);
    }

    const aggregated = this.messageTransformer.aggregateMetadata(children);

    // Collect all non-usage/performance metadata from all children
    const groupMetadata: Record<string, any> = {};
    children.forEach((child) => {
      if ((child as any).metadata) {
        Object.assign(groupMetadata, (child as any).metadata);
      }
    });

    // If there's group-level metadata, apply it to first child and remove from others
    if (Object.keys(groupMetadata).length > 0 && children.length > 0) {
      // Ensure first child has the group metadata
      if (!(children[0] as any).metadata) {
        (children[0] as any).metadata = {};
      }
      Object.assign((children[0] as any).metadata, groupMetadata);

      // Remove metadata from subsequent children (keep only in first child)
      for (let i = 1; i < children.length; i++) {
        delete (children[i] as any).metadata;
      }
    }

    const result: Message = {
      ...firstAssistant,
      children,
      content: '',
      role: 'assistantGroup' as any,
    };

    // Remove fields that should not be in assistantGroup
    delete result.imageList;
    delete result.metadata;
    delete result.reasoning;
    delete result.tools;

    // Add aggregated fields if they exist
    if (aggregated.performance) result.performance = aggregated.performance;
    if (aggregated.usage) result.usage = aggregated.usage;

    // Add group-level metadata if it exists
    if (Object.keys(groupMetadata).length > 0) {
      result.metadata = groupMetadata;
    }

    return result;
  }

  /**
   * Create user message with branch metadata
   */
  private createUserMessageWithBranches(
    user: Message,
    count: number,
    activeBranchIndex: number,
  ): Message {
    return {
      ...user,
      branch: {
        activeBranchIndex,
        count,
      },
    } as Message;
  }
}
