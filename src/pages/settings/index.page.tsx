import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSwitchSideBarOnInit } from '@/store/global';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Settings from './features/Settings';
import DesktopLayout from './layout';
import MobileLayout from './layout.mobile';

const Setting = memo(() => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  useSwitchSideBarOnInit('settings');

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
