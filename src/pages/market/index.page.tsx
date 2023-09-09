import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { createI18nNext } from '@/locales/create';
import { useOnFinishHydrationGlobal, useSwitchSideBarOnInit } from '@/store/global';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import GridCard from './features/GridCard';
import DesktopLayout from './layout';
import MobileLayout from './layout.mobile';

const initI18n = createI18nNext({ namespace: 'market' });

const Market = memo(() => {
  const { t } = useTranslation('common');
  const pageTitle = genSiteHeadTitle(t('tab.market'));
  const { mobile } = useResponsive();

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  useSwitchSideBarOnInit('market');

  useOnFinishHydrationGlobal(() => {
    initI18n.then(() => {});
  });

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <RenderLayout>
        <GridCard />
      </RenderLayout>
    </>
  );
});

export default Market;
