'use client';

import { Tag } from 'antd';
import { useResponsive } from 'antd-style';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useActiveSettingsKey } from '@/hooks/useActiveSettingsKey';
import { SettingsTabs } from '@/store/global/initialState';

import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const Layout = memo<LayoutProps>(({ children, category }) => {
  const ref = useRef<any>(null);
  const { md = true, mobile = false } = useResponsive();
  const { t } = useTranslation('setting');
  const activeKey = useActiveSettingsKey();

  return (
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
        <Header
          getContainer={() => ref.current}
          title={
            <>
              {t(`tab.${activeKey}`)}
              {activeKey === SettingsTabs.Sync && <Tag color={'gold'}>{t('tab.experiment')}</Tag>}
            </>
          }
        >
          {category}
        </Header>
      )}
      <Flexbox
        align={'center'}
        height={'100%'}
        style={{ overflowX: 'hidden', overflowY: 'auto' }}
        width={'100%'}
      >
        <Flexbox
          gap={64}
          style={{
            maxWidth: 1024,
            padding: mobile ? undefined : '32px 24px',
          }}
          width={'100%'}
        >
          {children}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
