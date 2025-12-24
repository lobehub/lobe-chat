'use client';

import { Flexbox } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import EditorCanvas from './EditorCanvas';
import Title from './Title';

const useStyles = createStyles(({ css }) => ({
  content: css`
    overflow: auto;
    flex: 1;
    padding-inline: 12px;
  `,
}));

const DocumentBody = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox flex={1} height={'100%'} style={{ overflow: 'hidden' }}>
      <div className={styles.content}>
        <Title />
        <EditorCanvas />
      </div>
    </Flexbox>
  );
});

export default DocumentBody;
