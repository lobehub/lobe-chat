'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Migration from '@/app/(main)/chat/features/Migration';
import { useQuery } from '@/hooks/useQuery';

import { LayoutProps } from './type';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    display: unset;
  `,
  main: css`
    position: relative;
    overflow: hidden;
    display: none;
    background: ${token.colorBgLayout};
  `,
}));

const Layout = memo<LayoutProps>(({ children, session }) => {
  const { showMobileWorkspace } = useQuery();
  const { cx, styles } = useStyles();

  return (
    <>
      <Flexbox
        className={cx(styles.main, !showMobileWorkspace && styles.active)}
        height="100%"
        width="100%"
      >
        {session}
      </Flexbox>
      <Flexbox
        className={cx(styles.main, showMobileWorkspace && styles.active)}
        height="100%"
        id={'lobe-workspace-mobile'}
        width="100%"
      >
        {children}
      </Flexbox>
      <Migration />
    </>
  );
});

Layout.displayName = 'MobileChatLayout';

export default Layout;
