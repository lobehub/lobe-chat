import { Markdown, MarkdownProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';

import { normalizeThinkTags, processWithArtifact } from '../../utils/markdown';

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
  markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
}

const MessageContent = memo<ContentBlockProps>(({ content, hasTools, markdownProps }) => {
  const message = normalizeThinkTags(processWithArtifact(content));

  const { styles, cx } = useStyles();

  if (!content && !hasTools) return <BubblesLoading />;

  if (content === LOADING_FLAT) {
    if (hasTools) return null;

    return <BubblesLoading />;
  }

  return (
    content && (
      <Markdown {...markdownProps} className={cx(hasTools && styles.pWithTool)} variant={'chat'}>
        {message}
      </Markdown>
    )
  );
});

export default MessageContent;
