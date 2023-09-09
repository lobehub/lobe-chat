import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { createI18nNext } from '@/locales/create';
import { useOnFinishHydrationGlobal, useSwitchSideBarOnInit } from '@/store/global';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Settings from './features/Settings';
import DesktopLayout from './layout';
import MobileLayout from './layout.mobile';

const initI18n = createI18nNext({ namespace: 'setting' });

const Setting = memo(() => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  useSwitchSideBarOnInit('settings');

  useOnFinishHydrationGlobal(() => {
    initI18n.then(() => {});
  });

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <RenderLayout>
        <Settings />
      </RenderLayout>
    </>
  );
});

export default Setting;
