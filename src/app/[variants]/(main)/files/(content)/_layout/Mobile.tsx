'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useQuery } from '@/hooks/useQuery';

import { LayoutProps } from './type';

const useStyles = createStyles(({ css, token }) => ({
  main: css`
    position: relative;
    overflow: hidden;
    background: ${token.colorBgLayout};
  `,
}));

const Layout = memo<LayoutProps>(({ children, menu }) => {
  const { showMobileWorkspace } = useQuery();
  const { styles } = useStyles();

  return (
    <>
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? { display: 'none' } : undefined}
        width="100%"
      >
        {menu}
      </Flexbox>
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? undefined : { display: 'none' }}
        width="100%"
      >
        {children}
      </Flexbox>
    </>
  );
});

Layout.displayName = 'MobileChatLayout';

export default Layout;
