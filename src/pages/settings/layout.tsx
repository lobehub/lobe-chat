import Head from 'next/head';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import AppLayout from '@/layout/AppLayout';
import { createI18nNext } from '@/locales/create';
import { useOnFinishHydrationGlobal, useSwitchSideBarOnInit } from '@/store/global';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

const initI18n = createI18nNext({ namespace: 'setting' });

const SettingLayout = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));

  useSwitchSideBarOnInit('settings');

  useOnFinishHydrationGlobal(() => {
    initI18n.then(() => {});
  });

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <AppLayout>
        <Flexbox flex={1} height={'100vh'} style={{ position: 'relative' }}>
          {children}
        </Flexbox>
      </AppLayout>
    </>
  );
});

export default SettingLayout;
