'use client';

import { Alert } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import {
  type ActionKey,
  type ActionKeys,
  MobileChatInput as ChatInput,
  ChatInputProvider,
} from '@/features/ChatInput';
import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/slices/aiChat/selectors';

import { useSend } from '../useSend';

const leftActions: ActionKeys[] = [
  'model',
  'search',
  'fileUpload',
  'knowledgeBase',
  'tools',
  '---',
  ['params', 'history', 'stt', 'clear'],
  'mainToken',
];

const rightActions: ActionKey[] = ['saveTopic'];

const MobileChatInput = memo(() => {
  const { t } = useTranslation('chat');
  const { send, disabled, generating, stop } = useSend();

  const [mainInputSendErrorMsg, clearSendMessageError] = useChatStore((s) => [
    aiChatSelectors.isCurrentSendMessageError(s),
    s.clearSendMessageError,
  ]);
  return (
    <ChatInputProvider
      chatInputEditorRef={(instance) => {
        if (!instance) return;
        useChatStore.setState({ mainInputEditor: instance });
      }}
      leftActions={leftActions}
      mobile
      onMarkdownContentChange={(content) => {
        useChatStore.setState({ inputMessage: content });
      }}
      onSend={() => send()}
      rightActions={rightActions}
      sendButtonProps={{ disabled, generating, onStop: stop }}
    >
      {mainInputSendErrorMsg && (
        <Flexbox paddingBlock={'0 6px'} paddingInline={12}>
          <Alert
            closable
            message={t('input.errorMsg', { errorMsg: mainInputSendErrorMsg })}
            onClose={clearSendMessageError}
            type={'warning'}
          />
        </Flexbox>
      )}
      <ChatInput />
    </ChatInputProvider>
  );
});

MobileChatInput.displayName = 'MobileChatInput';

export default MobileChatInput;
