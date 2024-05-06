'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

import Migration from '@/app/(main)/chat/features/Migration';
import { useQuery } from '@/hooks/useQuery';

import { LayoutProps } from './type';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    transform: translateX(0);
  `,
  workspace: css`
    position: absolute;
    z-index: 102;
    inset: 0;
    transform: translateX(100%);

    background: ${token.colorBgLayout};
    box-shadow: ${token.boxShadow};
  `,
}));

const Layout = memo<LayoutProps>(({ children, session }) => {
  const { active: showWorkspace } = useQuery();
  const { cx, styles } = useStyles();

  return (
    <>
      {session}
      <div className={cx(styles.workspace, showWorkspace && styles.active)}>{children}</div>
      <Migration />
    </>
  );
});

Layout.displayName = 'MobileChatLayout';

export default Layout;
