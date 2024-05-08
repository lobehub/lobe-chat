'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(
  ({ css, token }) => css`
    flex: none;
    width: 100%;
    height: 6px;
    background: ${token.colorFillTertiary};
  `,
);

const Divider = memo(() => {
  const { styles } = useStyles();

  return <div className={styles} />;
});

export default Divider;
