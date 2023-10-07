'use client';

import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import MobileLayout from '../layout.mobile';
import DesktopLayout from './Desktop';

const Setting = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));

  useSwitchSideBarOnInit(SidebarTabKey.Setting);

  return (
    <>
      <PageTitle title={pageTitle} />
      <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout} isMobile={useIsMobile}>
        {children}
      </ResponsiveLayout>
    </>
  );
};

export default Setting;
