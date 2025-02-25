'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';

const MessageFromUrl = () => {
  const updateInputMessage = useChatStore((s) => s.updateInputMessage);
  const { send: sendMessage } = useSendMessage();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      // Remove message from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('message');
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);

      updateInputMessage(message);
      sendMessage();
    }
  }, [searchParams, updateInputMessage, sendMessage]);

  return null;
};

export default MessageFromUrl;
