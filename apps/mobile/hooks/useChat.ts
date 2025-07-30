import { useCallback, useState } from 'react';

import { useChatStore } from '@/mobile/store/chat/index';
import { useSessionStore } from '@/mobile/store/session';

export function useChat() {
  const { activeId } = useSessionStore();
  const { getMessages, isLoading, sendMessage, stopGenerating, clearMessages, regenerateMessage } =
    useChatStore();
  const [input, setInput] = useState('');

  const messages = getMessages(activeId);

  const handleInputChange = useCallback((text: string) => {
    setInput(text);
  }, []);

  const handleSubmit = useCallback(
    async (e?: any) => {
      e?.preventDefault();

      if (!input.trim() || isLoading) return;

      const content = input.trim();
      setInput('');

      console.log('content', content);

      try {
        await sendMessage(activeId, content);
      } catch (error: any) {
        console.log('error', error);
        // 错误处理已在 store 中完成
        setInput(content); // 发送失败时恢复输入
      }
    },
    [activeId, input, isLoading, sendMessage],
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      try {
        await regenerateMessage(activeId, messageId);
      } catch (error: any) {
        console.log('regenerate error', error);
        throw error;
      }
    },
    [activeId, regenerateMessage],
  );

  return {
    clearMessages,
    handleInputChange,
    handleRegenerate,
    handleSubmit,
    input,
    isLoading,
    messages,
    stopGenerating,
  };
}
