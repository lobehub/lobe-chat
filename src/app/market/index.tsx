'use client';

import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useMarketStore } from '@/store/market';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import AgentCard, { AgentCardProps } from './features/AgentCard';
import AgentSearchBar from './features/AgentSearchBar';

const Market = memo<AgentCardProps>(({ defaultAgents }) => {
  const { t } = useTranslation('common');
  const pageTitle = genSiteHeadTitle(t('tab.market'));

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useMarketStore.persist.rehydrate();
  }, []);

  return (
    <>
      <PageTitle title={pageTitle} />
      <AgentSearchBar />
      <AgentCard defaultAgents={defaultAgents} />
    </>
  );
});

export default Market;
