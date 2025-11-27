import type { StateCreator } from 'zustand';

import { MESSAGE_CANCEL_FLAT } from '@/const/index';
import { useChatStore } from '@/store/chat';

import type { Store as ConversationStore } from '../../action';

/**
 * Generation Actions
 *
 * Handles generation control (stop, cancel, regenerate, continue)
 */
export interface GenerationAction {
  /**
   * Cancel a specific operation
   */
  cancelOperation: (operationId: string, reason?: string) => void;

  /**
   * Clear all operations
   */
  clearOperations: () => void;

  /**
   * Clear TTS for a message
   * @deprecated Temporary bridge to ChatStore
   */
  clearTTS: (messageId: string) => Promise<void>;

  /**
   * Clear translate for a message
   * @deprecated Temporary bridge to ChatStore
   */
  clearTranslate: (messageId: string) => Promise<void>;

  /**
   * Continue generation from a message
   */
  continueGeneration: (messageId: string) => Promise<void>;

  /**
   * Continue generation from a specific block
   * @deprecated Temporary bridge to ChatStore
   */
  continueGenerationMessage: (blockId: string, messageId: string) => Promise<void>;

  /**
   * Delete and regenerate a message
   * @deprecated Temporary bridge to ChatStore
   */
  delAndRegenerateMessage: (messageId: string) => Promise<void>;

  /**
   * Delete and resend a thread message
   * @deprecated Temporary bridge to ChatStore
   */
  delAndResendThreadMessage: (messageId: string) => Promise<void>;

  /**
   * Open thread creator
   * @deprecated Temporary bridge to ChatStore
   */
  openThreadCreator: (messageId: string) => void;

  /**
   * Re-invoke a tool message
   * @deprecated Temporary bridge to ChatStore
   */
  reInvokeToolMessage: (messageId: string) => Promise<void>;

  /**
   * Regenerate an assistant message
   */
  regenerateAssistantMessage: (messageId: string) => Promise<void>;

  /**
   * Regenerate a message
   * @deprecated
   */
  regenerateMessage: (messageId: string) => Promise<void>;

  /**
   * Regenerate a user message
   */
  regenerateUserMessage: (messageId: string) => Promise<void>;

  /**
   * Resend a thread message
   * @deprecated Temporary bridge to ChatStore
   */
  resendThreadMessage: (messageId: string) => Promise<void>;

  /**
   * Stop current generation
   */
  stopGenerating: () => void;

  /**
   * Translate a message
   * @deprecated Temporary bridge to ChatStore
   */
  translateMessage: (messageId: string, targetLang: string) => Promise<void>;

  /**
   * TTS a message
   * @deprecated Temporary bridge to ChatStore
   */
  ttsMessage: (
    messageId: string,
    state?: { contentMd5?: string; file?: string; voice?: string },
  ) => Promise<void>;
}

export const generationSlice: StateCreator<
  ConversationStore,
  [['zustand/devtools', never]],
  [],
  GenerationAction
> = (set, get) => ({
  cancelOperation: (operationId: string, reason?: string) => {
    const state = get();
    const { hooks } = state;

    const chatStore = useChatStore.getState();
    chatStore.cancelOperation(operationId, reason || 'User cancelled');

    // ===== Hook: onOperationCancelled =====
    if (hooks.onOperationCancelled) {
      hooks.onOperationCancelled(operationId);
    }
  },

  clearOperations: () => {
    // Operations are now managed by ChatStore, nothing to clear locally
  },

  clearTTS: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.clearTTS(messageId);
  },

  clearTranslate: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.clearTranslate(messageId);
  },

  continueGeneration: async (messageId: string) => {
    const state = get();
    const { hooks } = state;

    const chatStore = useChatStore.getState();

    // ===== Hook: onBeforeContinue =====
    if (hooks.onBeforeContinue) {
      const shouldProceed = await hooks.onBeforeContinue(messageId);
      if (shouldProceed === false) return;
    }

    // Delegate to global ChatStore
    // Note: continueGenerationMessage takes (blockId, messageId)
    // For now, we use messageId for both since we don't have block ID
    await chatStore.continueGenerationMessage(messageId, messageId);

    // ===== Hook: onContinueComplete =====
    if (hooks.onContinueComplete) {
      hooks.onContinueComplete(messageId);
    }
  },

  continueGenerationMessage: async (blockId: string, messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.continueGenerationMessage(blockId, messageId);
  },

  delAndRegenerateMessage: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.delAndRegenerateMessage(messageId);
  },

  delAndResendThreadMessage: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.delAndResendThreadMessage(messageId);
  },

  openThreadCreator: (messageId: string) => {
    const chatStore = useChatStore.getState();
    chatStore.openThreadCreator(messageId);
  },

  reInvokeToolMessage: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.reInvokeToolMessage(messageId);
  },

  regenerateAssistantMessage: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.regenerateAssistantMessage(messageId);
  },

  regenerateMessage: async (messageId: string) => {
    const state = get();
    const { hooks } = state;

    const chatStore = useChatStore.getState();

    // Determine message type and call appropriate regenerate method
    const message = chatStore.messagesMap[Object.keys(chatStore.messagesMap)[0]]?.find(
      (m) => m.id === messageId,
    );

    if (!message) return;

    // ===== Hook: onBeforeRegenerate =====
    if (hooks.onBeforeRegenerate) {
      const shouldProceed = await hooks.onBeforeRegenerate(messageId);
      if (shouldProceed === false) return;
    }

    // Delegate to global ChatStore based on role
    if (message.role === 'user') {
      await chatStore.regenerateUserMessage(messageId);
    } else if (message.role === 'assistant' || message.role === 'assistantGroup') {
      await chatStore.regenerateAssistantMessage(messageId);
    }

    // ===== Hook: onRegenerateComplete =====
    if (hooks.onRegenerateComplete) {
      hooks.onRegenerateComplete(messageId);
    }
  },

  // ===== Temporary Bridge Methods =====
  // These methods delegate to ChatStore and will be properly implemented later
  regenerateUserMessage: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.regenerateUserMessage(messageId);
  },

  resendThreadMessage: async (messageId: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.resendThreadMessage(messageId);
  },

  stopGenerating: () => {
    const state = get();
    const { context, hooks } = state;
    const { agentId, topicId } = context;

    const chatStore = useChatStore.getState();

    // Cancel all running execAgentRuntime operations in this conversation context
    chatStore.cancelOperations(
      { agentId, status: 'running', topicId, type: 'execAgentRuntime' },
      MESSAGE_CANCEL_FLAT,
    );

    // ===== Hook: onGenerationStop =====
    if (hooks.onGenerationStop) {
      hooks.onGenerationStop();
    }
  },

  translateMessage: async (messageId: string, targetLang: string) => {
    const chatStore = useChatStore.getState();
    await chatStore.translateMessage(messageId, targetLang);
  },

  ttsMessage: async (
    messageId: string,
    state?: { contentMd5?: string; file?: string; voice?: string },
  ) => {
    const chatStore = useChatStore.getState();
    await chatStore.ttsMessage(messageId, state);
  },
});
