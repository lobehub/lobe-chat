import { createStyles } from 'antd-style';
import { memo } from 'react';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import MarkdownMessage from '@/features/Conversation/Markdown';

import { normalizeThinkTags, processWithArtifact } from '../../../utils/markdown';
import { useMarkdown } from '../useMarkdown';

const useStyles = createStyles(({ css, token }) => {
  return {
    pWithTool: css`
      color: ${token.colorTextTertiary};
    `,
  };
});
interface ContentBlockProps {
  content: string;
  hasTools?: boolean;
  id: string;
}

const MessageContent = memo<ContentBlockProps>(({ content, hasTools, id }) => {
  const message = normalizeThinkTags(processWithArtifact(content));
  const markdownProps = useMarkdown(id);
  const { styles, cx } = useStyles();

  if (!content && !hasTools) return <BubblesLoading />;

  if (content === LOADING_FLAT) {
    if (hasTools) return null;

    return <BubblesLoading />;
  }

  return (
    content && (
      <MarkdownMessage {...markdownProps} className={cx(hasTools && styles.pWithTool)}>
        {message}
      </MarkdownMessage>
    )
  );
});

export default MessageContent;
