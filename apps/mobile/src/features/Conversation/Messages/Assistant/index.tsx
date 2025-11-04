import { UIChatMessage } from '@lobechat/types';
import React, { memo, useCallback } from 'react';

import ChatItem from '@/features/ChatItem';
import Actions from '@/features/ChatItem/components/Actions';
import MessageContent from '@/features/ChatItem/components/MessageContent';

import { AssistantMessageContent } from './MessageContent';

export interface AssistantMessageProps {
  index: number;
  isLoading?: boolean;
  markdownProps?: any;
  message: UIChatMessage;
  showActions?: boolean;
  showActionsBar?: boolean;
  showTime?: boolean;
  showTitle?: boolean;
  totalLength: number;
}

const AssistantMessage = memo<AssistantMessageProps>(
  ({
    message,
    isLoading,
    markdownProps,
    showActions = true,
    showActionsBar = true,
    showTime = true,
    showTitle = true,
  }) => {
    const renderMessage = useCallback(
      (editableContent: React.ReactNode) => (
        <AssistantMessageContent
          {...message}
          editableContent={editableContent}
          isGenerating={isLoading}
        />
      ),
      [message, isLoading],
    );

    const editableContent = (
      <MessageContent
        content={message.content}
        isLoading={isLoading}
        markdownProps={markdownProps}
      />
    );

    const actionsNode =
      showActions && showActionsBar && !isLoading && (message.content || message.error) ? (
        <Actions message={message} />
      ) : undefined;

    return (
      <ChatItem
        actions={actionsNode}
        avatar={{
          avatar: message.meta?.avatar,
          backgroundColor: message.meta?.backgroundColor,
          title: message.meta?.title,
        }}
        error={message.error}
        loading={isLoading}
        markdownProps={markdownProps}
        message={message.content}
        placement="left"
        primary={false}
        renderMessage={renderMessage ? () => renderMessage(editableContent) : undefined}
        showTime={showTime}
        showTitle={showTitle}
        time={message.createdAt}
        variant="bubble"
      />
    );
  },
);

AssistantMessage.displayName = 'AssistantMessage';

export default AssistantMessage;
