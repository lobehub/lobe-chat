'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';

import { LayoutProps } from './type';

const useStyles = createStyles(({ css, token }) => ({
  main: css`
    position: relative;
    overflow: hidden;
    background: ${token.colorBgLayout};
  `,
}));

const Layout = memo<LayoutProps>(({ children }) => {
  const showMobileWorkspace = useShowMobileWorkspace();
  const { styles } = useStyles();

  return (
    <Flexbox
      className={styles.main}
      height="100%"
      style={showMobileWorkspace ? { display: 'none' } : undefined}
      width="100%"
    >
      {children}
    </Flexbox>
  );
});

Layout.displayName = 'MobileChatLayout';

export default Layout;
