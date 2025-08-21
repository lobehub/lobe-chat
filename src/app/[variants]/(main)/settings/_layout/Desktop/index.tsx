'use client';

import { useResponsive, useTheme } from 'antd-style';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';

import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const SKIP_PATHS = ['/settings/provider', '/settings/agent'];

const ContentContainer = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();
  const isSkip = SKIP_PATHS.some((path) => pathname.includes(path));

  return isSkip ? (
    children
  ) : (
    <SettingContainer addonAfter={<Footer />}>{children}</SettingContainer>
  );
});

const Layout = memo<LayoutProps>(({ children, category }) => {
  const ref = useRef<any>(null);
  const { md = true } = useResponsive();
  const theme = useTheme();

  useEffect(() => {
    console.log('settings render');
  });

  return (
    <Flexbox
      height={'100%'}
      horizontal={md}
      ref={ref}
      style={{ background: theme.colorBgContainer, flex: '1', position: 'relative' }}
    >
      {md ? (
        <SideBar>{category}</SideBar>
      ) : (
        <Header getContainer={() => ref.current!}>{category}</Header>
      )}
      <ContentContainer>{children}</ContentContainer>
      <InitClientDB />
    </Flexbox>
  );
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
