import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { type ActionKeys, ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import { useChatStore } from '@/store/chat';

import StarterList from './StarterList';

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
    <Flexbox gap={8}>
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
        <DesktopChatInput
          inputContainerProps={{
            minHeight: 88,
            resize: false,
            style: {
              borderRadius: 20,
              boxShadow: '0 12px 32px rgba(0,0,0,.04)',
            },
          }}
        />
      </ChatInputProvider>
      <StarterList />
    </Flexbox>
  );
});

export default InputArea;
