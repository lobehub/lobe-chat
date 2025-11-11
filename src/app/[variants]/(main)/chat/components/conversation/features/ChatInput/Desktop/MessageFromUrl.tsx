'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useChatStore } from '@/store/chat';

import { useSend } from '../useSend';

const MessageFromUrl = () => {
  const updateMessageInput = useChatStore((s) => s.updateMessageInput);
  const { send: sendMessage } = useSend();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      // Remove message from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('message');
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);

      updateMessageInput(message);
      sendMessage();
    }
  }, [searchParams, updateMessageInput, sendMessage]);

  return null;
};

export default MessageFromUrl;
