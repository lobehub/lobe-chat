import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { chatSelectors } from '@/store/chat/selectors';

export function useChat() {
  const { activeId } = useSessionStore();

  // Chat Store actions
  const sendMessage = useChatStore((s) => s.sendMessage);
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);
  const clearMessage = useChatStore((s) => s.clearMessage);
  const stopGenerateMessage = useChatStore((s) => s.stopGenerateMessage);
  const updateInputMessage = useChatStore((s) => s.updateInputMessage);

  // Chat Store state
  const input = useChatStore((s) => s.inputMessage);
  const messages = useChatStore((s) => chatSelectors.mainDisplayChats(s));
  const isSendButtonDisabled = useChatStore((s) => chatSelectors.isSendButtonDisabledByMessage(s));

  const handleInputChange = useCallback(
    (text: string) => {
      updateInputMessage(text);
    },
    [updateInputMessage],
  );

  const handleSubmit = useCallback(
    async (e?: any) => {
      e?.preventDefault();

      if (!input.trim() || isSendButtonDisabled) return;

      const content = input.trim();

      // 清空输入
      updateInputMessage('');

      console.log('Sending message:', content);

      try {
        await sendMessage({
          files: [],
          message: content, // TODO: 支持文件上传
          onlyAddUserMessage: false,
        });
      } catch (error: any) {
        console.error('Send message error:', error);
        // 发送失败时恢复输入
        updateInputMessage(content);
        throw error;
      }
    },
    [input, isSendButtonDisabled, sendMessage, updateInputMessage],
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

    // Actions
    clearMessages: handleClearMessages,

    handleInputChange,

    handleRegenerate,

    handleSubmit,

    // State
    input,

    isLoading: isSendButtonDisabled,

    messages,

    stopGenerating: handleStopGenerating,
  };
}
