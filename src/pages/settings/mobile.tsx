import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import Router from 'next/router';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import AppMobileLayout from '@/layout/AppMobileLayout';

const SettingLayout = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('setting');

  return (
    <AppMobileLayout
      navBar={
        <MobileNavBar
          center={<MobileNavBarTitle title={t('header.global')} />}
          onBackClick={() => Router.back()}
          showBackButton
        />
      }
      showTabBar
    >
      {children}
    </AppMobileLayout>
  );
});

export default SettingLayout;
