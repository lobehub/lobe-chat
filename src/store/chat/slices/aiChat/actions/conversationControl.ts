/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { type AgentRuntimeContext } from '@lobechat/agent-runtime';
import { MESSAGE_CANCEL_FLAT } from '@lobechat/const';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { displayMessageSelectors } from '../../../selectors';
import { messageMapKey } from '../../../utils/messageMapKey';
import { dbMessageSelectors } from '../../message/selectors';

/**
 * Actions for controlling conversation operations like cancellation and error handling
 */
export interface ConversationControlAction {
  /**
   * Interrupts the ongoing ai message generation process
   */
  stopGenerateMessage: () => void;
  /**
   * Cancels sendMessage operation for a specific topic/session
   */
  cancelSendMessageInServer: (topicId?: string) => void;
  /**
   * Clears any error messages from the send message operation
   */
  clearSendMessageError: () => void;
  /**
   * Switches to a different branch of a message
   */
  switchMessageBranch: (messageId: string, branchIndex: number) => Promise<void>;
  /**
   * Approve tool intervention
   */
  approveToolCalling: (toolMessageId: string, assistantGroupId: string) => Promise<void>;
  /**
   * Reject tool intervention
   */
  rejectToolCalling: (messageId: string, reason?: string) => Promise<void>;
  /**
   * Reject tool intervention and continue
   */
  rejectAndContinueToolCalling: (messageId: string, reason?: string) => Promise<void>;
}

export const conversationControl: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ConversationControlAction
> = (set, get) => ({
  stopGenerateMessage: () => {
    const { activeId, activeTopicId, cancelOperations } = get();

    // Cancel all running execAgentRuntime operations in the current context
    cancelOperations(
      {
        type: 'execAgentRuntime',
        status: 'running',
        sessionId: activeId,
        topicId: activeTopicId,
      },
      MESSAGE_CANCEL_FLAT,
    );
  },

  cancelSendMessageInServer: (topicId?: string) => {
    const { activeId, activeTopicId } = get();

    // Determine which operation to cancel
    const targetTopicId = topicId ?? activeTopicId;
    const contextKey = messageMapKey(activeId, targetTopicId);

    // Cancel operations in the operation system
    const operationIds = get().operationsByContext[contextKey] || [];

    operationIds.forEach((opId) => {
      const operation = get().operations[opId];
      if (operation && operation.type === 'sendMessage' && operation.status === 'running') {
        get().cancelOperation(opId, 'User cancelled');
      }
    });

    // Restore editor state if it's the active session
    if (contextKey === messageMapKey(activeId, activeTopicId)) {
      // Find the latest sendMessage operation with editor state
      for (const opId of [...operationIds].reverse()) {
        const op = get().operations[opId];
        if (op && op.type === 'sendMessage' && op.metadata.inputEditorTempState) {
          get().mainInputEditor?.setJSONState(op.metadata.inputEditorTempState);
          break;
        }
      }
    }
  },

  clearSendMessageError: () => {
    const { activeId, activeTopicId } = get();
    const contextKey = messageMapKey(activeId, activeTopicId);
    const operationIds = get().operationsByContext[contextKey] || [];

    // Clear error message from all sendMessage operations in current context
    operationIds.forEach((opId) => {
      const op = get().operations[opId];
      if (op && op.type === 'sendMessage' && op.metadata.inputSendErrorMsg) {
        get().updateOperationMetadata(opId, { inputSendErrorMsg: undefined });
      }
    });
  },

  switchMessageBranch: async (messageId, branchIndex) => {
    await get().optimisticUpdateMessageMetadata(messageId, { activeBranchIndex: branchIndex });
  },
  approveToolCalling: async (toolMessageId) => {
    const { activeThreadId, internal_execAgentRuntime } = get();

    // 1. Get tool message and verify it exists
    const toolMessage = dbMessageSelectors.getDbMessageById(toolMessageId)(get());
    if (!toolMessage) return;

    // 2. Update intervention status to approved
    await get().optimisticUpdatePlugin(toolMessageId, { intervention: { status: 'approved' } });

    // 3. Get current messages for state construction
    const currentMessages = displayMessageSelectors.mainAIChats(get());

    // 4. Create agent state and context with user intervention config
    const { state, context: initialContext } = get().internal_createAgentState({
      messages: currentMessages,
      parentMessageId: toolMessageId,
      threadId: activeThreadId,
    });

    // 5. Override context with 'human_approved_tool' phase
    const context: AgentRuntimeContext = {
      ...initialContext,
      phase: 'human_approved_tool',
      payload: {
        approvedToolCall: toolMessage.plugin,
        parentMessageId: toolMessageId,
        skipCreateToolMessage: true,
      },
    };

    // 7. Execute agent runtime from tool message position
    try {
      await internal_execAgentRuntime({
        messages: currentMessages,
        parentMessageId: toolMessageId, // Start from tool message
        parentMessageType: 'tool', // Type is 'tool'
        sessionId: get().activeId,
        topicId: get().activeTopicId,
        threadId: activeThreadId,
        initialState: state,
        initialContext: context,
      });
    } catch (error) {
      console.error('[approveToolCalling] Error executing agent runtime:', error);
    }
  },

  rejectToolCalling: async (messageId, reason) => {
    const toolMessage = dbMessageSelectors.getDbMessageById(messageId)(get());
    if (!toolMessage) return;

    // Optimistic update - update status to rejected and save reason
    const intervention = {
      rejectedReason: reason,
      status: 'rejected',
    } as const;
    await get().optimisticUpdatePlugin(toolMessage.id, { intervention });

    const toolContent = !!reason
      ? `User reject this tool calling with reason: ${reason}`
      : 'User reject this tool calling without reason';

    await get().optimisticUpdateMessageContent(messageId, toolContent);
  },

  rejectAndContinueToolCalling: async (messageId, reason) => {
    await get().rejectToolCalling(messageId, reason);

    const toolMessage = dbMessageSelectors.getDbMessageById(messageId)(get());
    if (!toolMessage) return;

    // Get current messages for state construction
    const currentMessages = displayMessageSelectors.mainAIChats(get());
    const { activeThreadId, internal_execAgentRuntime } = get();

    // Create agent state and context to continue from rejected tool message
    const { state, context: initialContext } = get().internal_createAgentState({
      messages: currentMessages,
      parentMessageId: messageId,
      threadId: activeThreadId,
    });

    // Override context with 'userInput' phase to continue as if user provided feedback
    const context: AgentRuntimeContext = {
      ...initialContext,
      phase: 'user_input',
    };

    // Execute agent runtime from rejected tool message position to continue
    try {
      await internal_execAgentRuntime({
        messages: currentMessages,
        parentMessageId: messageId,
        parentMessageType: 'tool',
        sessionId: get().activeId,
        topicId: get().activeTopicId,
        threadId: activeThreadId,
        initialState: state,
        initialContext: context,
      });
    } catch (error) {
      console.error('[rejectAndContinueToolCalling] Error executing agent runtime:', error);
    }
  },
});
