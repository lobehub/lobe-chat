'use client';

import type { SlashOptions } from '@lobehub/editor';
import { Alert } from '@lobehub/ui';
import type { MenuProps } from '@lobehub/ui/es/Menu';
import { type ReactNode, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import {
  type ActionKeys,
  ChatInputProvider,
  DesktopChatInput,
  MobileChatInput,
} from '@/features/ChatInput';
import type { SendButtonHandler, SendButtonProps } from '@/features/ChatInput/store/initialState';
import { useChatStore } from '@/store/chat';
import { fileChatSelectors, useFileStore } from '@/store/file';

import WideScreenContainer from '../components/WideScreenContainer';
import { messageStateSelectors, useConversationStore } from '../store';

export interface ChatInputProps {
  /**
   * Custom children to render instead of default Desktop/Mobile components.
   * Use this to add custom UI like error alerts, MessageFromUrl, etc.
   */
  children?: ReactNode;
  /**
   * Left action buttons configuration
   */
  leftActions?: ActionKeys[];
  /**
   * Mention items for @ mentions (for group chat)
   */
  mentionItems?: SlashOptions['items'];
  /**
   * Mobile mode
   */
  mobile?: boolean;
  /**
   * Callback when editor instance is ready
   */
  onEditorReady?: (editor: any) => void;
  /**
   * Right action buttons configuration
   */
  rightActions?: ActionKeys[];
  /**
   * Custom send button props override
   */
  sendButtonProps?: Partial<SendButtonProps>;
  /**
   * Send menu configuration (for send options like Enter/Cmd+Enter, Add AI/User message)
   */
  sendMenu?: MenuProps;
}

/**
 * ChatInput component for Conversation
 *
 * Uses ConversationStore for state management instead of global ChatStore.
 * Reuses the UI components from @/features/ChatInput.
 */
const ChatInput = memo<ChatInputProps>(
  ({
    mobile = false,
    leftActions = [],
    rightActions = [],
    children,
    mentionItems,
    sendMenu,
    sendButtonProps: customSendButtonProps,
    onEditorReady,
  }) => {
    const { t } = useTranslation('chat');

    // ConversationStore state
    const [agentId, inputMessage, sendMessage, stopGenerating] = useConversationStore((s) => [
      s.context.agentId,
      s.inputMessage,
      s.sendMessage,
      s.stopGenerating,
    ]);
    const updateInputMessage = useConversationStore((s) => s.updateInputMessage);
    const setEditor = useConversationStore((s) => s.setEditor);

    // Generation state from ConversationStore (bridged from ChatStore)
    const isAIGenerating = useConversationStore(messageStateSelectors.isAIGenerating);

    // Send message error from ConversationStore
    const sendMessageErrorMsg = useConversationStore(messageStateSelectors.sendMessageError);
    const clearSendMessageError = useChatStore((s) => s.clearSendMessageError);

    // File store - for UI state only (disabled button, etc.)
    const fileList = useFileStore(fileChatSelectors.chatUploadFileList);
    const isUploadingFiles = useFileStore(fileChatSelectors.isUploadingFiles);

    // Computed state
    const isInputEmpty = !inputMessage.trim() && fileList.length === 0;
    const disabled = isInputEmpty || isUploadingFiles || isAIGenerating;

    // Send handler - gets message, clears editor immediately, then sends
    const handleSend: SendButtonHandler = useCallback(
      async ({ clearContent, getMarkdownContent }) => {
        // Get instant values from stores at trigger time
        const fileStore = useFileStore.getState();
        const currentFileList = fileChatSelectors.chatUploadFileList(fileStore);
        const currentIsUploading = fileChatSelectors.isUploadingFiles(fileStore);

        if (currentIsUploading || isAIGenerating) return;

        // Get content before clearing
        const message = getMarkdownContent();
        if (!message.trim() && currentFileList.length === 0) return;

        // Clear content immediately for responsive UX
        clearContent();
        fileStore.clearChatUploadFileList();

        // Fire and forget - send with captured message
        await sendMessage({ files: currentFileList, message });
      },
      [isAIGenerating, sendMessage],
    );

    const sendButtonProps: SendButtonProps = {
      disabled,
      generating: isAIGenerating,
      onStop: stopGenerating,
      ...customSendButtonProps,
    };

    const defaultContent = mobile ? (
      <MobileChatInput />
    ) : (
      <WideScreenContainer>
        {sendMessageErrorMsg && (
          <Flexbox paddingBlock={'0 6px'} paddingInline={12}>
            <Alert
              closable
              message={t('input.errorMsg', { errorMsg: sendMessageErrorMsg })}
              onClose={clearSendMessageError}
              type={'warning'}
            />
          </Flexbox>
        )}
        <DesktopChatInput />
      </WideScreenContainer>
    );

    return (
      <ChatInputProvider
        agentId={agentId}
        chatInputEditorRef={(instance) => {
          if (instance) {
            setEditor(instance);
            onEditorReady?.(instance);
          }
        }}
        leftActions={leftActions}
        mentionItems={mentionItems}
        mobile={mobile}
        onMarkdownContentChange={updateInputMessage}
        onSend={handleSend}
        rightActions={rightActions}
        sendButtonProps={sendButtonProps}
        sendMenu={sendMenu}
      >
        {children ?? defaultContent}
      </ChatInputProvider>
    );
  },
);

ChatInput.displayName = 'ConversationChatInput';

export default ChatInput;
