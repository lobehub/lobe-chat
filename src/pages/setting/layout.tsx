import Head from 'next/head';
import { ReactNode, memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SideBar from '@/features/SideBar';
import { createI18nNext } from '@/locales/create';
import { useSettings } from '@/store/settings';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

const initI18n = createI18nNext('setting');

const SettingLayout = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));

  useEffect(() => {
    initI18n.finally();
  }, []);

  useEffect(() => {
    const hasRehydrated = useSettings.persist.hasHydrated();
    if (hasRehydrated) {
      useSettings.setState({ sidebarKey: 'setting' });
    }
  }, []);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Flexbox horizontal width={'100%'}>
        <SideBar />
        <Flexbox flex={1} height={'100vh'} style={{ position: 'relative' }}>
          {children}
        </Flexbox>
      </Flexbox>
    </>
  );
});

export default SettingLayout;
