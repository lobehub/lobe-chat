'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useChatStore } from '@/store/chat';

import { useSend } from '../useSend';

const MessageFromUrl = () => {
  const updateMessageInput = useChatStore((s) => s.updateMessageInput);
  const { send: sendMessage } = useSend();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (!message) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('message');
    setSearchParams(params, { replace: true });

    updateMessageInput(message);
    sendMessage();
  }, [searchParams, setSearchParams, updateMessageInput, sendMessage]);

  return null;
};

export default MessageFromUrl;
