'use client';

import { useResponsive } from 'antd-style';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import MobileLayout from '../layout.mobile';
import DesktopLayout from './Desktop';

const Setting = memo<{ children: ReactNode }>(({ children }) => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  useSwitchSideBarOnInit(SidebarTabKey.Setting);

  return (
    <>
      <PageTitle title={pageTitle} />
      <RenderLayout>{children}</RenderLayout>
    </>
  );
});

export default Setting;
