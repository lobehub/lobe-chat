'use client';

import { Skeleton, Tag } from 'antd';
import dynamic from 'next/dynamic';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveSettingsKey } from '@/hooks/useActiveSettingsKey';
import { SettingsTabs } from '@/store/global/initialState';

import SettingModalLayout from '../../_layout/SettingModalLayout';

const CategoryContent = dynamic(
  () => import('@/app/(main)/settings/@category/features/CategoryContent'),
  { loading: () => <Skeleton paragraph={{ rows: 6 }} title={false} />, ssr: false },
);
const UpgradeAlert = dynamic(() => import('@/app/(main)/settings/features/UpgradeAlert'), {
  ssr: false,
});

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { t } = useTranslation('setting');
  const activeKey = useActiveSettingsKey();
  return (
    <SettingModalLayout
      activeTitle={
        <>
          {t(`tab.${activeKey}`)}
          {activeKey === SettingsTabs.Sync && <Tag color={'gold'}>{t('tab.experiment')}</Tag>}
        </>
      }
      category={
        <>
          <CategoryContent modal />
          <UpgradeAlert />
        </>
      }
    >
      {children}
    </SettingModalLayout>
  );
});

export default Layout;
