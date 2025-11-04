import { LoadingDots, Markdown, MarkdownProps } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';

import { useSettingStore } from '@/store/setting';

interface MessageContentProps {
  content: string;
  isLoading?: boolean;
  markdownProps?: Partial<MarkdownProps>;
}

const MessageContent = memo<MessageContentProps>(({ content, isLoading, markdownProps }) => {
  const { fontSize } = useSettingStore();

  return useMemo(() => {
    if (isLoading) {
      return <LoadingDots size={10} variant="pulse" />;
    }

    return (
      <Markdown fontSize={fontSize} {...markdownProps}>
        {content}
      </Markdown>
    );
  }, [fontSize, isLoading, content, markdownProps]);
});

MessageContent.displayName = 'MessageContent';

export default MessageContent;
