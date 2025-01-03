'use client';

import { useResponsive } from 'antd-style';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';
import { useActiveProfileKey } from '@/hooks/useActiveTabKey';

import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const Layout = memo<LayoutProps>(({ children, category }) => {
  const ref = useRef<any>(null);
  const { md = true } = useResponsive();
  const { t } = useTranslation('auth');
  const activeKey = useActiveProfileKey();

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
          <Header getContainer={() => ref.current} title={<>{t(`tab.${activeKey}`)}</>}>
            {category}
          </Header>
        )}
        <SettingContainer addonAfter={<Footer />}>{children}</SettingContainer>
      </Flexbox>
      <InitClientDB />
    </>
  );
});

Layout.displayName = 'DesktopProfileLayout';

export default Layout;
