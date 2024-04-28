'use client';

import { type MobileNavBarTitleProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { CSSProperties, PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { SidebarTabKey } from '@/store/global/initialState';

const MobileTabBar = dynamic(() => import('@/features/MobileTabBar'));

const useStyles = createStyles(({ css, cx, stylish }) => ({
  container: cx(
    stylish.noScrollbar,
    css`
      position: relative;
      overflow: hidden auto;
      width: 100vw;
      height: 100%;
    `,
  ),
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
  showTabBar?: boolean;
  style?: CSSProperties;
  tabBarKey?: SidebarTabKey;
  title?: MobileNavBarTitleProps;
}

const AppLayoutMobile = memo<AppMobileLayoutProps>(
  ({ children, showTabBar, tabBarKey, style, className }) => {
    const { styles, cx } = useStyles();

    return (
      <Flexbox className={cx(styles.container, className)} style={style}>
        {children}
        {showTabBar && (
          <>
            <SafeSpacing mobile position={'bottom'} />
            <MobileTabBar className={styles.mobileTabBar} tabBarKey={tabBarKey} />
          </>
        )}
      </Flexbox>
    );
  },
);

export default AppLayoutMobile;
