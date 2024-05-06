'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(
  ({ css, token, isDarkMode }) => css`
    flex: none;
    width: 100%;
    height: 6px;
    background: ${isDarkMode ? token.colorBgContainer : token.colorBgLayout};
  `,
);

const Divider = memo(() => {
  const { styles } = useStyles();

  return <div className={styles} />;
});

export default Divider;
