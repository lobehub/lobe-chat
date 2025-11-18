/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { type AgentRuntimeContext } from '@lobechat/agent-runtime';
import { MESSAGE_CANCEL_FLAT } from '@lobechat/const';
import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { setNamespace } from '@/utils/storeDebug';

import { displayMessageSelectors } from '../../../selectors';
import { messageMapKey } from '../../../utils/messageMapKey';
import { dbMessageSelectors } from '../../message/selectors';
import { MainSendMessageOperation } from '../initialState';

const n = setNamespace('ai');

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
  /**
   * Toggle sendMessage operation state
   */
  internal_toggleSendMessageOperation: (
    key: string | { sessionId: string; topicId?: string | null },
    loading: boolean,
    cancelReason?: string,
  ) => AbortController | undefined;
  /**
   * Update sendMessage operation metadata
   */
  internal_updateSendMessageOperation: (
    key: string | { sessionId: string; topicId?: string | null },
    value: Partial<MainSendMessageOperation> | null,
    actionName?: any,
  ) => void;
}

export const conversationControl: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ConversationControlAction
> = (set, get) => ({
  stopGenerateMessage: () => {
    const { chatLoadingIdsAbortController, internal_toggleChatLoading } = get();

    if (!chatLoadingIdsAbortController) return;

    chatLoadingIdsAbortController.abort(MESSAGE_CANCEL_FLAT);

    internal_toggleChatLoading(false, undefined, n('stopGenerateMessage') as string);
  },

  cancelSendMessageInServer: (topicId?: string) => {
    const { activeId, activeTopicId } = get();

    // Determine which operation to cancel
    const targetTopicId = topicId ?? activeTopicId;
    const operationKey = messageMapKey(activeId, targetTopicId);

    // Cancel the specific operation
    get().internal_toggleSendMessageOperation(
      operationKey,
      false,
      'User cancelled sendMessage operation',
    );

    // Only clear creating message state if it's the active session
    if (operationKey === messageMapKey(activeId, activeTopicId)) {
      const editorTempState = get().mainSendMessageOperations[operationKey]?.inputEditorTempState;

      if (editorTempState) get().mainInputEditor?.setJSONState(editorTempState);
    }
  },

  clearSendMessageError: () => {
    get().internal_updateSendMessageOperation(
      { sessionId: get().activeId, topicId: get().activeTopicId },
      null,
      'clearSendMessageError',
    );
  },

  switchMessageBranch: async (messageId, branchIndex) => {
    await get().optimisticUpdateMessageMetadata(messageId, { activeBranchIndex: branchIndex });
  },

  internal_toggleSendMessageOperation: (key, loading: boolean, cancelReason?: string) => {
    if (loading) {
      const abortController = new AbortController();

      get().internal_updateSendMessageOperation(
        key,
        { isLoading: true, abortController },
        n('toggleSendMessageOperation(start)', { key }),
      );

      return abortController;
    } else {
      const operationKey =
        typeof key === 'string' ? key : messageMapKey(key.sessionId, key.topicId);

      const operation = get().mainSendMessageOperations[operationKey];

      // If cancelReason is provided, abort the operation first
      if (cancelReason && operation?.isLoading) {
        operation.abortController?.abort(cancelReason);
      }

      get().internal_updateSendMessageOperation(
        key,
        { isLoading: false, abortController: null },
        n('toggleSendMessageOperation(stop)', { key, cancelReason }),
      );

      return undefined;
    }
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

  internal_updateSendMessageOperation: (key, value, actionName) => {
    const operationKey = typeof key === 'string' ? key : messageMapKey(key.sessionId, key.topicId);

    set(
      produce((draft) => {
        if (!draft.mainSendMessageOperations[operationKey])
          draft.mainSendMessageOperations[operationKey] = value;
        else {
          if (value === null) {
            delete draft.mainSendMessageOperations[operationKey];
          } else {
            draft.mainSendMessageOperations[operationKey] = {
              ...draft.mainSendMessageOperations[operationKey],
              ...value,
            };
          }
        }
      }),
      false,
      actionName ?? n('updateSendMessageOperation', { operationKey, value }),
    );
  },
});
