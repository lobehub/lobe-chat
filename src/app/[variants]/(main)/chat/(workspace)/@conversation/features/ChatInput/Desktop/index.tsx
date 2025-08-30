'use client';

import { memo } from 'react';

import DesktopChatInput from '@/features/ChatInput/Desktop';
import { ChatInputProvider } from '@/features/ChatInput/hooks/useChatInput';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';

const Desktop = memo(() => {
  return (
    <ChatInputProvider
      config={{
        actions: [
          'model',
          'search',
          'typo',
          'fileUpload',
          'knowledgeBase',
          'tools',
          '---',
          ['params', 'history', 'stt', 'clear'],
          'mainToken',
        ],
      }}
    >
      <WideScreenContainer>
        <DesktopChatInput />
      </WideScreenContainer>
    </ChatInputProvider>
  );
});

export default Desktop;
