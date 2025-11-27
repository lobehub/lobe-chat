'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import { withSuspense } from '@/components/withSuspense';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';

import SessionPanelContent from '../session';

const useStyles = createStyles(({ css, token }) => ({
  main: css`
    position: relative;
    overflow: hidden;
    background: ${token.colorBgLayout};
  `,
}));

const Layout = memo(() => {
  const showMobileWorkspace = useShowMobileWorkspace();
  const { styles } = useStyles();

  return (
    <>
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? { display: 'none' } : undefined}
        width="100%"
      >
        <SessionPanelContent />
      </Flexbox>
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? undefined : { display: 'none' }}
        width="100%"
      >
        <Outlet />
      </Flexbox>
    </>
  );
});

Layout.displayName = 'MobileChatLayout';

export default withSuspense(Layout);
