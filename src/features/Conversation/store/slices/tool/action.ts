import type { StateCreator } from 'zustand';

import { useChatStore } from '@/store/chat';

import type { Store as ConversationStore } from '../../action';
import { dataSelectors } from '../data/selectors';

/**
 * Tool Interaction Actions
 *
 * Handles tool call approval and rejection
 */
export interface ToolAction {
  /**
   * Approve a tool call
   */
  approveToolCall: (toolMessageId: string, assistantGroupId: string) => Promise<void>;

  /**
   * Reject a tool call and continue the conversation
   */
  rejectAndContinueToolCall: (toolMessageId: string, reason?: string) => Promise<void>;

  /**
   * Reject a tool call
   */
  rejectToolCall: (toolMessageId: string, reason?: string) => Promise<void>;
}

export const toolSlice: StateCreator<
  ConversationStore,
  [['zustand/devtools', never]],
  [],
  ToolAction
> = (set, get) => ({
  approveToolCall: async (toolMessageId: string, assistantGroupId: string) => {
    const state = get();
    const { hooks, context } = state;

    // ===== Hook: onToolApproved =====
    if (hooks.onToolApproved) {
      const shouldProceed = await hooks.onToolApproved(toolMessageId);
      if (shouldProceed === false) return;
    }

    // Delegate to global ChatStore with context for correct conversation scope
    const chatStore = useChatStore.getState();
    await chatStore.approveToolCalling(toolMessageId, assistantGroupId, context);

    // ===== Hook: onToolCallComplete =====
    if (hooks.onToolCallComplete) {
      hooks.onToolCallComplete(toolMessageId, undefined);
    }
  },

  rejectAndContinueToolCall: async (toolMessageId: string, reason?: string) => {
    const { context } = get();

    // First reject the tool call
    await get().rejectToolCall(toolMessageId, reason);

    // Then delegate to ChatStore to continue the conversation with context
    const chatStore = useChatStore.getState();
    await chatStore.rejectAndContinueToolCalling(toolMessageId, reason, context);
  },

  rejectToolCall: async (toolMessageId: string, reason?: string) => {
    const state = get();
    const { hooks, updateMessagePlugin, updateMessageContent } = state;

    // ===== Hook: onToolRejected =====
    if (hooks.onToolRejected) {
      const shouldProceed = await hooks.onToolRejected(toolMessageId, reason);
      if (shouldProceed === false) return;
    }

    const toolMessage = dataSelectors.getDbMessageById(toolMessageId)(state);
    if (!toolMessage) return;

    // Update intervention status to rejected
    await updateMessagePlugin(toolMessageId, {
      intervention: {
        rejectedReason: reason,
        status: 'rejected',
      },
    });

    // Update tool message content with rejection reason
    const toolContent = !!reason
      ? `User reject this tool calling with reason: ${reason}`
      : 'User reject this tool calling without reason';

    await updateMessageContent(toolMessageId, toolContent);
  },
});
