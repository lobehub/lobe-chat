import { UIChatMessage } from '@lobechat/types';
import { ReactNode, memo, useCallback, useMemo } from 'react';

import ChatItem from '@/features/ChatItem';
import MessageContent from '@/features/ChatItem/components/MessageContent';

import { UserMessageContent } from './MessageContent';

export interface UserMessageProps {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isGenerating?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLastMessage?: boolean;
  isLoading?: boolean;
  message: UIChatMessage;
  showActions?: boolean;
  showActionsBar?: boolean;
  showTime?: boolean;
  showTitle?: boolean;
  totalLength: number;
}

const UserMessage = memo<UserMessageProps>(
  ({ message, isLoading, showTime = false, showTitle = false }) => {
    // Create markdownProps for User messages (no animated)
    const markdownProps = useMemo(() => ({}), []);
    const renderMessage = useCallback(
      (editableContent: ReactNode) => (
        <UserMessageContent {...message} editableContent={editableContent} />
      ),
      [message],
    );

    const editableContent = (
      <MessageContent
        content={message.content}
        isLoading={isLoading}
        markdownProps={markdownProps}
      />
    );

    return (
      <ChatItem
        avatar={{
          avatar: message.meta?.avatar,
          backgroundColor: message.meta?.backgroundColor,
          title: message.meta?.title,
        }}
        error={message.error}
        loading={isLoading}
        markdownProps={markdownProps}
        message={message.content}
        placement="right"
        primary={true}
        renderMessage={renderMessage ? () => renderMessage(editableContent) : undefined}
        showTime={showTime}
        showTitle={showTitle}
        time={message.createdAt}
        variant="bubble"
      />
    );
  },
);

UserMessage.displayName = 'UserMessage';

export default UserMessage;
