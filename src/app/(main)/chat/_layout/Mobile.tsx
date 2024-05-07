'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

import Migration from '@/app/(main)/chat/features/Migration';
import { useQuery } from '@/hooks/useQuery';

import { LayoutProps } from './type';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    display: unset;
  `,
  workspace: css`
    position: absolute;
    z-index: 102;
    inset: 0;

    display: none;

    background: ${token.colorBgLayout};
  `,
}));

const Layout = memo<LayoutProps>(({ children, session }) => {
  const { showMobileWorkspace } = useQuery();
  const { cx, styles } = useStyles();

  return (
    <>
      {session}
      <div className={cx(styles.workspace, showMobileWorkspace && styles.active)}>{children}</div>
      <Migration />
    </>
  );
});

Layout.displayName = 'MobileChatLayout';

export default Layout;
