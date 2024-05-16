'use client';

import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';

const useStyles = createStyles(
  ({ css, token, isDarkMode }) => css`
    flex: none;
    width: 100%;
    height: 6px;
    background: ${isDarkMode ? rgba(token.colorFillTertiary, 0.04) : token.colorFillTertiary};
  `,
);

const Divider = memo(() => {
  const { styles } = useStyles();

  return <div className={styles} />;
});

export default Divider;
