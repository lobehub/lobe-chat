import { Markdown } from '@lobehub/ui';
import { memo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

import { useContainerStyles } from '../style';

const Preview = memo<{ content: string }>(({ content }) => {
  const { styles } = useContainerStyles();
  const isMobile = useIsMobile();

  return (
    <div className={styles.preview} style={{ padding: 12 }}>
      <Markdown variant={isMobile ? 'chat' : undefined}>{content}</Markdown>
    </div>
  );
});

export default Preview;
