import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useMarketStore } from '@/store/market';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import AgentCard from './features/AgentCard';
import AgentSearchBar from './features/AgentSearchBar';
import DesktopLayout from './layout';
import MobileLayout from './layout.mobile';

const Market = memo(() => {
  const { t } = useTranslation('common');
  const pageTitle = genSiteHeadTitle(t('tab.market'));
  const { mobile } = useResponsive();

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useMarketStore.persist.rehydrate();
  }, []);

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <RenderLayout>
        <AgentSearchBar />
        <AgentCard />
      </RenderLayout>
    </>
  );
});

export default Market;
