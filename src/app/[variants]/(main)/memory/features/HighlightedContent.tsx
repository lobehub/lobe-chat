import { Markdown, Text } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface HighlightedContentProps {
  children?: string | null;
  title?: string | null;
}

const HighlightedContent = memo<HighlightedContentProps>(({ title, children }) => {
  if (!children) return;

  const content = (
    <Markdown
      fontSize={14}
      style={{
        overflow: 'visible',
      }}
      variant={'chat'}
    >
      {children || ''}
    </Markdown>
  );

  if (!title) return content;

  return (
    <Flexbox gap={8}>
      <Text weight={500}>{title}</Text>
      {content}
    </Flexbox>
  );
});

export default HighlightedContent;
