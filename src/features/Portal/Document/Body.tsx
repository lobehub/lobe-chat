'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';

import EditorCanvas from './EditorCanvas';
import Title from './Title';

const styles = createStaticStyles(({ css }) => ({
  content: css`
    overflow: auto;
    flex: 1;
    padding-inline: 12px;
  `,
}));

const DocumentBody = memo(() => {
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
