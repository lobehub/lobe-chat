import { Flexbox, LoadingDots, Markdown, MarkdownProps } from '@lobehub/ui-rn';
import { ReactNode, memo, useMemo } from 'react';

import { useSettingStore } from '@/store/setting';

interface MessageContentProps {
  content: string;
  isLoading?: boolean;
  markdownProps?: Partial<MarkdownProps>;
  messageExtra?: ReactNode;
}

const MessageContent = memo<MessageContentProps>(
  ({ content, isLoading, markdownProps, messageExtra }) => {
    const { fontSize } = useSettingStore();

    const messageContent = useMemo(() => {
      if (isLoading) {
        return <LoadingDots size={10} variant="pulse" />;
      }

      return (
        <Markdown fontSize={fontSize} {...markdownProps}>
          {content}
        </Markdown>
      );
    }, [fontSize, isLoading, content, markdownProps]);

    // 如果有 messageExtra，需要用 Flexbox 包裹
    if (messageExtra) {
      return (
        <Flexbox gap={8}>
          {messageContent}
          {messageExtra}
        </Flexbox>
      );
    }

    return messageContent;
  },
);

MessageContent.displayName = 'MessageContent';

export default MessageContent;
