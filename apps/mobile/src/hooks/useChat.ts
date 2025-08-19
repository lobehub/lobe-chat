import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { chatSelectors } from '@/store/chat/selectors';
import { useSendMessage } from './useSendMessage';

export function useChat() {
  const { activeId } = useSessionStore();

  // Use the new useSendMessage hook for consistent data flow
  const { canSend, send: sendMessage } = useSendMessage();

  // Chat Store actions
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);
  const clearMessage = useChatStore((s) => s.clearMessage);
  const stopGenerateMessage = useChatStore((s) => s.stopGenerateMessage);
  const updateInputMessage = useChatStore((s) => s.updateInputMessage);

  // Chat Store state
  const input = useChatStore((s) => s.inputMessage);
  const messages = useChatStore((s) => chatSelectors.mainDisplayChats(s));
  const isLoading = useChatStore((s) => chatSelectors.isAIGenerating(s)); // Separate loading state from canSend

  const handleInputChange = useCallback(
    (text: string) => {
      updateInputMessage(text);
    },
    [updateInputMessage],
  );

  const handleSubmit = useCallback(
    (e?: any) => {
      e?.preventDefault();

      if (!input.trim() || !canSend) return;

      console.log('Sending message:', input.trim());

      try {
        sendMessage({
          onlyAddUserMessage: false,
        });
      } catch (error: any) {
        console.error('Send message error:', error);
        throw error;
      }
    },
    [input, canSend, sendMessage],
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      try {
        await regenerateMessage(messageId);
      } catch (error: any) {
        console.error('Regenerate message error:', error);
        throw error;
      }
    },
    [regenerateMessage],
  );

  const handleClearMessages = useCallback(async () => {
    try {
      await clearMessage();
    } catch (error: any) {
      console.error('Clear messages error:', error);
      throw error;
    }
  }, [clearMessage]);

  const handleStopGenerating = useCallback(() => {
    stopGenerateMessage();
  }, [stopGenerateMessage]);

  return {
    // Session info
    activeId,

    canSend,

    // Actions
    clearMessages: handleClearMessages,

    handleInputChange,

    handleRegenerate,

    handleSubmit,

    // State
    input,

    isLoading,

    messages,

    stopGenerating: handleStopGenerating,
  };
}
