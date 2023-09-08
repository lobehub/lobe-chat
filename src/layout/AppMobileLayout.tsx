import { type MobileNavBarTitleProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Head from 'next/head';
import { CSSProperties, PropsWithChildren, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import MobileTabBar from '@/features/MobileTabBar';
import { useOnFinishHydrationSession, useSessionStore } from '@/store/session';

const useStyles = createStyles(({ css }) => ({
  container: css`
    position: relative;

    overflow-x: hidden;
    overflow-y: auto;

    width: 100vw;
    height: 100vh;
  `,
  mobileNavBar: css`
    position: fixed;
    z-index: 100;
    top: 0;
    right: 0;
    left: 0;
  `,
  mobileTabBar: css`
    position: fixed;
    z-index: 100;
    right: 0;
    bottom: 0;
    left: 0;
  `,
}));

interface AppMobileLayoutProps extends PropsWithChildren {
  className?: string;
  navBar?: ReactNode;
  showTabBar?: boolean;
  style?: CSSProperties;
  title?: MobileNavBarTitleProps;
}

const AppMobileLayout = memo<AppMobileLayoutProps>(
  ({ children, showTabBar, navBar, style, className }) => {
    const { styles, cx } = useStyles();

    useOnFinishHydrationSession(() => {
      useSessionStore.setState({ isMobile: true });
    }, []);

    return (
      <>
        <Head>
          <meta
            content="width=device-width, initial-scale=1.0, viewport-fit=cover"
            name="viewport"
          />
        </Head>
        <Flexbox className={cx(styles.container, className)} style={style}>
          {navBar && (
            <>
              <div className={styles.mobileNavBar}>{navBar}</div>
              <SafeSpacing mobile position={'top'} />
            </>
          )}
          {children}
          {showTabBar && (
            <>
              <SafeSpacing mobile position={'bottom'} />
              <MobileTabBar className={styles.mobileTabBar} />
            </>
          )}
        </Flexbox>
      </>
    );
  },
);

export default AppMobileLayout;
