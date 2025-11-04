import { UIChatMessage } from '@lobechat/types';
import { memo, useMemo } from 'react';

import ChatItem from '@/features/ChatItem';

export interface SupervisorMessageProps {
  index: number;
  isGenerating?: boolean;
  isLastMessage?: boolean;
  isLoading?: boolean;
  message: UIChatMessage;
  showActions?: boolean;
  showTime?: boolean;
  showTitle?: boolean;
  totalLength: number;
}

const SupervisorMessage = memo<SupervisorMessageProps>(
  ({ message, isLoading, isGenerating, isLastMessage, showTime = true, showTitle = true }) => {
    // Create markdownProps for Supervisor messages (with animated and enableCustomFootnotes)
    const markdownProps = useMemo(
      () => ({
        animated: isLastMessage && isGenerating,
        enableCustomFootnotes: true,
      }),
      [isLastMessage, isGenerating],
    );
    // Supervisor uses system avatar/title
    const supervisorMeta = {
      avatar: '🤖',
      title: 'Supervisor',
    };

    return (
      <ChatItem
        avatar={supervisorMeta}
        error={message.error}
        loading={isLoading}
        markdownProps={markdownProps}
        message={message.content}
        placement="left"
        primary={false}
        showTime={showTime}
        showTitle={showTitle}
        time={message.createdAt}
        variant="bubble"
      />
    );
  },
);

SupervisorMessage.displayName = 'SupervisorMessage';

export default SupervisorMessage;
