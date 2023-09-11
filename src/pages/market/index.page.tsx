import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import DesktopLayout from './layout';
import MobileLayout from './layout.mobile';

const Market = memo(() => {
  const { t } = useTranslation('common');
  const pageTitle = genSiteHeadTitle(t('tab.market'));
  const { mobile } = useResponsive();

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <RenderLayout>
        <h1>🤯 Coming Soon</h1>
      </RenderLayout>
    </>
  );
});

export default Market;
