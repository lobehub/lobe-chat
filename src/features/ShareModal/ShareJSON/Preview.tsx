import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';

import { useContainerStyles } from '../style';

const Preview = memo<{ content: string }>(({ content }) => {
  const { styles } = useContainerStyles();

  return (
    <div className={styles.preview} style={{ padding: 16 }}>
      <Highlighter language={'json'} type={'pure'} wrap>
        {content}
      </Highlighter>
    </div>
  );
});

export default Preview;
