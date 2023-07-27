import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from './style';

const OpenAiBizError = memo<{ content: string; id: string }>(({ content }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.container} style={{ maxWidth: 600 }}>
      <Highlighter language={'json'}>{content}</Highlighter>
    </Flexbox>
  );
});

export default OpenAiBizError;
