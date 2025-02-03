'use client';

import { useResponsive } from 'antd-style';
import { memo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';

import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const Layout = memo<LayoutProps>(({ children, category }) => {
  const ref = useRef<any>(null);
  const { md = true } = useResponsive();

  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal={md}
        ref={ref}
        style={{ position: 'relative' }}
        width={'100%'}
      >
        {md ? (
          <SideBar>{category}</SideBar>
        ) : (
          <Header getContainer={() => ref.current}>{category}</Header>
        )}
        <SettingContainer addonAfter={<Footer />}>{children}</SettingContainer>
      </Flexbox>
      <InitClientDB />
    </>
  );
});

Layout.displayName = 'DesktopProfileLayout';

export default Layout;
