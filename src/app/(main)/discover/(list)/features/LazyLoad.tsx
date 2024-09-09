'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import Lazy from 'react-lazy-load';

const useStyles = createStyles(({ css }) => ({
  compactLazy: css`
    min-height: 120px;
  `,
}));
const LazyLoad = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <Lazy className={styles.compactLazy} offset={240}>
      {children}
    </Lazy>
  );
});

export default LazyLoad;
