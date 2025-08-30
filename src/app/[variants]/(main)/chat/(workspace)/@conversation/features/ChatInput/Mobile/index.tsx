'use client';

import { memo } from 'react';

import ChatInput from '@/features/ChatInput/Mobile';
import { ChatInputProvider } from '@/features/ChatInput/hooks/useChatInput';

const MobileChatInput = memo(() => {
  return (
    <ChatInputProvider
      config={{
        actions: [
          'model',
          'search',
          'fileUpload',
          'knowledgeBase',
          'tools',
          '---',
          ['params', 'history', 'stt', 'clear'],
          'mainToken',
        ],
        mobile: true,
      }}
    >
      <ChatInput />
    </ChatInputProvider>
  );
});

MobileChatInput.displayName = 'MobileChatInput';

export default MobileChatInput;
