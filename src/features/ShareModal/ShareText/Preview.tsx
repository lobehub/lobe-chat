import { Markdown } from '@lobehub/ui';
import { memo } from 'react';

import { useContainerStyles } from '../style';

const Preview = memo<{ content: string }>(({ content }) => {
  const { styles } = useContainerStyles();

  return (
    <div className={styles.preview} style={{ padding: 12 }}>
      <Markdown>{content}</Markdown>
    </div>
  );
});

export default Preview;
