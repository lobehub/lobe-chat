'use client';

import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import DesktopLayout from './layout.desktop';
import MobileLayout from './layout.mobile';

const Setting = memo<{ children: ReactNode }>(({ children }) => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  useSwitchSideBarOnInit(SidebarTabKey.Setting);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <RenderLayout>{children}</RenderLayout>
    </>
  );
});

export default Setting;
