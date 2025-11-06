import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { fileSelectors } from '@/store/file/selectors';
import { useFileStore } from '@/store/file/store';
import { useSessionStore } from '@/store/session';

import { useSendMessage } from './useSendMessage';

export function useChat() {
  const { activeId } = useSessionStore();

  // Use the new useSendMessage hook for consistent data flow
  const { canSend, generating, send: sendMessage } = useSendMessage();

  // Chat Store actions
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);
  const clearMessage = useChatStore((s) => s.clearMessage);
  const stopGenerateMessage = useChatStore((s) => s.stopGenerateMessage);
  const updateInputMessage = useChatStore((s) => s.updateInputMessage);

  // Chat Store state
  const input = useChatStore((s) => s.inputMessage);
  const messages = useChatStore((s) => chatSelectors.mainDisplayChats(s));
  const isLoading = useChatStore((s) => chatSelectors.isAIGenerating(s)); // Separate loading state from canSend

  // File Store state - check if there are successfully uploaded files (aligned with web)
  const uploadFileList = useFileStore(fileSelectors.getChatUploadFileList);
  const hasSuccessFiles = uploadFileList.some((f) => f.status === 'success');

  const handleInputChange = useCallback(
    (text: string) => {
      updateInputMessage(text);
    },
    [updateInputMessage],
  );

  const handleSubmit = useCallback(
    (e?: any) => {
      e?.preventDefault();

      // Can send if there's text OR files (aligned with web)
      if ((!input.trim() && !hasSuccessFiles) || !canSend) return;

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
    [input, hasSuccessFiles, canSend, sendMessage],
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

    // Can send if there's text OR files (aligned with web)
    canSend: !!input.trim() || hasSuccessFiles,

    // Actions
    clearMessages: handleClearMessages,

    handleInputChange,

    handleRegenerate,

    handleSubmit,

    // State
    input,

    isGenerating: generating,

    isLoading: !canSend || isLoading,

    messages,

    stopGenerating: handleStopGenerating,
  };
}
