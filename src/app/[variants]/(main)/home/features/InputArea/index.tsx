import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { type ActionKeys, ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import { useChatStore } from '@/store/chat';

import StarterList from './StarterList';
import { useSend } from './useSend';

const leftActions: ActionKeys[] = ['model', 'search', 'fileUpload'];

const InputArea = memo(() => {
  const { loading, send } = useSend();

  return (
    <Flexbox gap={16} style={{ marginBottom: 16 }}>
      <ChatInputProvider
        chatInputEditorRef={(instance) => {
          if (!instance) return;
          useChatStore.setState({ mainInputEditor: instance });
        }}
        leftActions={leftActions}
        onMarkdownContentChange={(content) => {
          useChatStore.setState({ inputMessage: content });
        }}
        onSend={send}
        sendButtonProps={{
          disabled: loading,
          generating: loading,
          onStop: () => {},
          shape: 'round',
        }}
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
