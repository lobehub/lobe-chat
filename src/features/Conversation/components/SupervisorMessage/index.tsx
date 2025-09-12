'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ChatItem from '@/components/ChatItem/ChatItem';
import { DEFAULT_ORCHESTRATOR_AVATAR } from '@/const/meta';
import { ChatErrorType } from '@/types/fetch';
import { ChatMessage } from '@/types/message';

export interface SupervisorMessageProps {
  message: ChatMessage;
}

const SupervisorMessage = memo<SupervisorMessageProps>(({ message }) => {
  const { t } = useTranslation('chat');

  const errorMessage =
    message.error?.type === ChatErrorType.SupervisorDecisionFailed
      ? t('supervisor.decisionFailed', { ns: 'error' })
      : message.error?.message;

  return (
    <ChatItem
      avatar={{
        avatar: DEFAULT_ORCHESTRATOR_AVATAR,
        title: t('groupSidebar.members.orchestrator'),
      }}
      error={{
        message: errorMessage,
        type: 'error',
      }}
      loading={false}
      message={message.content}
      placement="left"
      primary={false}
      showTitle={true}
      time={message.updatedAt || message.createdAt}
      variant="bubble"
    />
  );
});

SupervisorMessage.displayName = 'SupervisorMessage';

export default SupervisorMessage;
