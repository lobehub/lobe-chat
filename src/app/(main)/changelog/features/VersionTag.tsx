'use client';

import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(({ token, css }) => {
  return {
    tag: css`
      margin: 0;
      padding-block: 4px;
      padding-inline: 12px;

      color: ${token.colorTextSecondary};

      border-radius: 16px;
    `,
  };
});

const VersionTag = memo<{ range: string[] }>(({ range }) => {
  const { styles } = useStyles();

  return <Tag className={styles.tag}>{range.map((v) => 'v' + v).join(' ~ ')}</Tag>;
});

export default VersionTag;
