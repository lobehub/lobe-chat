import { useEditor } from '@lobehub/editor/react';
import { ReactNode, memo, useRef } from 'react';

import StoreUpdater, { StoreUpdaterProps } from './StoreUpdater';
import { Provider, createStore } from './store';

interface ChatInputProviderProps extends StoreUpdaterProps {
  children: ReactNode;
}

export const ChatInputProvider = memo<ChatInputProviderProps>(
  ({
    children,
    leftActions,
    rightActions,
    mobile,
    sendButtonProps,
    onSend,
    sendMenu,
    chatInputEditorRef,
    onMarkdownContentChange,
  }) => {
    const editor = useEditor();
    const slashMenuRef = useRef<HTMLDivElement>(null);

    return (
      <Provider
        createStore={() =>
          createStore({
            editor,
            leftActions,
            mobile,
            rightActions,
            sendButtonProps,
            sendMenu,
            slashMenuRef,
          })
        }
      >
        <StoreUpdater
          chatInputEditorRef={chatInputEditorRef}
          leftActions={leftActions}
          mobile={mobile}
          onMarkdownContentChange={onMarkdownContentChange}
          onSend={onSend}
          rightActions={rightActions}
          sendButtonProps={sendButtonProps}
          sendMenu={sendMenu}
        />
        {children}
      </Provider>
    );
  },
);
