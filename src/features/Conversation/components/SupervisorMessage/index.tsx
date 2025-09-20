'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ChatItem from '@/components/ChatItem/ChatItem';
import { DEFAULT_SUPERVISOR_AVATAR } from '@/const/meta';
import { ChatErrorType } from '@/types/fetch';
import { ChatMessage } from '@/types/message';

export interface SupervisorMessageProps {
  message: ChatMessage;
}

const SupervisorMessage = memo<SupervisorMessageProps>(({ message }) => {
  const { t } = useTranslation('chat');

  const isTodoMessage =
    message.agentId === 'supervisor' && !message.error && message.content?.startsWith('### Todo List');

  const errorMessage =
    message.error?.type === ChatErrorType.SupervisorDecisionFailed
      ? t('supervisor.decisionFailed', { ns: 'error' })
      : message.error?.message;

  const errorProps = errorMessage
    ? {
        message: errorMessage,
        type: 'error' as const,
      }
    : undefined;

  return (
    <ChatItem
      avatar={{
        avatar: DEFAULT_SUPERVISOR_AVATAR,
        title: t('groupSidebar.members.orchestrator'),
      }}
      error={isTodoMessage ? undefined : errorProps}
      loading={false}
      message={message.content}
      placement="left"
      primary={false}
      showTitle={true}
      time={message.updatedAt || message.createdAt}
      variant={isTodoMessage ? 'docs' : 'bubble'}
    />
  );
});

SupervisorMessage.displayName = 'SupervisorMessage';

export default SupervisorMessage;
