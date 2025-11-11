import type { ContextNode, IdNode, Message, MessageNode } from '../types';

/**
 * MessageCollector - Handles collection of related messages
 *
 * Provides utilities for:
 * 1. Collecting messages in a group
 * 2. Collecting tool messages
 * 3. Collecting assistant chains
 * 4. Finding next messages in sequences
 */
export class MessageCollector {
  constructor(
    private messageMap: Map<string, Message>,
    private childrenMap: Map<string | null, string[]>,
  ) {}

  /**
   * Collect all messages belonging to a message group
   */
  collectGroupMembers(groupId: string, messages: Message[]): Message[] {
    return messages.filter((m) => m.groupId === groupId);
  }

  /**
   * Collect tool messages related to an assistant message
   */
  collectToolMessages(assistant: Message, messages: Message[]): Message[] {
    const toolCallIds = new Set(assistant.tools?.map((t) => t.id) || []);
    return messages.filter(
      (m) => m.role === 'tool' && m.tool_call_id && toolCallIds.has(m.tool_call_id),
    );
  }

  /**
   * Recursively collect the entire assistant chain
   * (assistant -> tools -> assistant -> tools -> ...)
   */
  collectAssistantChain(
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
   * Recursively collect assistant messages for an AssistantGroup (contextTree version)
   */
  collectAssistantGroupMessages(
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
   * Find next message after tools in an assistant group
   */
  findNextAfterTools(assistantMsg: Message, idNode: IdNode): IdNode | null {
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
  findLastNodeInAssistantGroup(idNode: IdNode): IdNode | null {
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
}
