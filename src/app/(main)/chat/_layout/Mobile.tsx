'use client';

import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';

import { useQuery } from '@/hooks/useQuery';

type Props = { children: ReactNode; session: ReactNode };

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    transform: translateX(0);
  `,
  mask: css`
    position: absolute;
    z-index: 101;
    inset: 0;

    background: ${token.colorBgMask};
    backdrop-filter: blur(2px);
  `,
  subPage: css`
    position: absolute;
    z-index: 102;
    inset: 0;
    transform: translateX(100%);

    background: ${token.colorBgLayout};
    box-shadow: ${token.boxShadow};

    transition: transform 0.3s ${token.motionEaseInOut};
  `,
}));

const Layout = memo<Props>(({ children, session }) => {
  const { active } = useQuery();
  const { cx, styles } = useStyles();

  return (
    <>
      {session}
      {active && <div className={styles.mask} />}
      <div className={cx(styles.subPage, active && styles.active)}>{children}</div>
    </>
  );
});

Layout.displayName = 'MobileChatLayout';

export default Layout;
