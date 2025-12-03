import { memo } from 'react';

import { type ActionKeys, ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import { useChatStore } from '@/store/chat';

const leftActions: ActionKeys[] = [
  'model',
  'search',
  'typo',
  'fileUpload',
  'knowledgeBase',
  'tools',
];

const InputArea = memo(() => {
  return (
    <ChatInputProvider
      chatInputEditorRef={(instance) => {
        if (!instance) return;
        useChatStore.setState({ mainInputEditor: instance });
      }}
      leftActions={leftActions}
      onMarkdownContentChange={(content) => {
        useChatStore.setState({ inputMessage: content });
      }}
      onSend={() => {
        // todo
      }}
      sendButtonProps={{ disabled: false, generating: false, onStop: () => {}, shape: 'round' }}
    >
      <DesktopChatInput />
    </ChatInputProvider>
  );
});

export default InputArea;
