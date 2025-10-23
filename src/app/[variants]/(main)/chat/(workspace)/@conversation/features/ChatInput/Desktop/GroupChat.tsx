'use client';

import { SlashOptions } from '@lobehub/editor';
import { Alert, Avatar, GroupAvatar } from '@lobehub/ui';
import { isEqual } from 'lodash';
import { Suspense, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR } from '@/const/meta';
import { type ActionKeys, ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { useSendGroupMessage } from '../useSend';
import MessageFromUrl from './MessageFromUrl';
import { useSendMenuItems } from './useSendMenuItems';

const leftActions: ActionKeys[] = [
  'typo',
  'fileUpload',
  'knowledgeBase',
  '---',
  ['stt', 'clear'],
  'groupChatToken',
];

const dmLeftActions: ActionKeys[] = ['typo', 'fileUpload', 'knowledgeBase', '---', ['stt']];

const rightActions: ActionKeys[] = ['saveTopic'];

/**
 * Message Editor for Group Chat along with DM Portal
 */
const Desktop = memo((props: { targetMemberId?: string }) => {
  const { t } = useTranslation('chat');
  const { send, generating, disabled, stop } = useSendGroupMessage();

  const isDMPortal = !!props.targetMemberId;
  const currentGroupMemebers = useSessionStore(sessionSelectors.currentGroupAgents, isEqual);

  const [mainInputSendErrorMsg, clearSendMessageError] = useChatStore((s) => [
    aiChatSelectors.isCurrentSendMessageError(s),
    s.clearSendMessageError,
  ]);

  const mentionItems: SlashOptions['items'] = useMemo(() => {
    if (!currentGroupMemebers) return [];
    return [
      {
        icon: (
          <GroupAvatar
            avatars={
              currentGroupMemebers?.map((member) => ({
                avatar: member.avatar || DEFAULT_AVATAR,
                background: member.backgroundColor || undefined,
              })) || []
            }
            size={24}
          />
        ),
        key: 'ALL_MEMBERS',
        label: t('memberSelection.allMembers'),
        metadata: { id: 'ALL_MEMBERS' },
      },
      ...currentGroupMemebers.map((member) => ({
        icon: (
          <Avatar
            avatar={member.avatar}
            background={member.backgroundColor ?? undefined}
            size={24}
          />
        ),
        key: member.id,
        label: member.title,
        metadata: { id: member.id },
      })),
    ];
  }, [currentGroupMemebers]);

  const sendMenuItems = useSendMenuItems();

  return (
    <ChatInputProvider
      chatInputEditorRef={(instance) => {
        if (!instance) return;
        useChatStore.setState({ mainInputEditor: instance });
      }}
      leftActions={isDMPortal ? dmLeftActions : leftActions}
      mentionItems={mentionItems}
      onMarkdownContentChange={(content) => {
        useChatStore.setState({ inputMessage: content });
      }}
      onSend={() => {
        send({ targetMemberId: props.targetMemberId });
      }}
      rightActions={isDMPortal ? [] : rightActions}
      sendButtonProps={{ disabled, generating, onStop: stop }}
      sendMenu={{
        items: sendMenuItems,
      }}
    >
      <WideScreenContainer>
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
        <DesktopChatInput />
      </WideScreenContainer>
      <Suspense>
        <MessageFromUrl />
      </Suspense>
    </ChatInputProvider>
  );
});

export default Desktop;
