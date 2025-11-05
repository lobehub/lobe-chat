import { Markdown, MarkdownProps } from '@lobehub/ui-rn';
import { memo } from 'react';

import { LOADING_FLAT } from '@/_const/message';
import Skeleton from '@/components/Skeleton';

interface MessageContentProps {
  content: string;
  hasTools?: boolean;
  markdownProps?: Omit<MarkdownProps, 'children'>;
}

const MessageContent = memo<MessageContentProps>(({ content, markdownProps }) => {
  if (content === LOADING_FLAT) return <Skeleton height={20} width="80%" />;

  return (
    content && (
      <Markdown {...markdownProps} variant={'chat'}>
        {content}
      </Markdown>
    )
  );
});

MessageContent.displayName = 'GroupMessageContent';

export default MessageContent;
