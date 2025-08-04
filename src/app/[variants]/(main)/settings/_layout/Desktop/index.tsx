'use client';

import { Tag } from '@lobehub/ui';
import { useResponsive, useTheme } from 'antd-style';
import { usePathname } from 'next/navigation';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';
import { useActiveSettingsKey } from '@/hooks/useActiveTabKey';
import { useProviderName } from '@/hooks/useProviderName';
import { SettingsTabs } from '@/store/global/initialState';

import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const SKIP_PATHS = ['/settings/provider', '/settings/agent'];

const Layout = memo<LayoutProps>(({ children, category }) => {
  const ref = useRef<any>(null);
  const { md = true } = useResponsive();
  const { t } = useTranslation('setting');
  const activeKey = useActiveSettingsKey();
  const theme = useTheme();
  const pathname = usePathname();
  const isSkip = SKIP_PATHS.some((path) => pathname.startsWith(path));
  const isProvider = pathname.includes('/settings/provider/');
  const providerName = useProviderName(activeKey);

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
        <Header
          getContainer={() => ref.current}
          title={
            <>
              {isProvider ? providerName : t(`tab.${activeKey}`)}
              {activeKey === SettingsTabs.Sync && <Tag color={'gold'}>{t('tab.experiment')}</Tag>}
            </>
          }
        >
          {category}
        </Header>
      )}
      {isSkip ? children : <SettingContainer addonAfter={<Footer />}>{children}</SettingContainer>}
      <InitClientDB />
    </Flexbox>
  );
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
