'use client';

import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useMarketStore } from '@/store/market';

import AgentSearchBar from './features/AgentSearchBar';

const Market = memo(() => {
  const { t } = useTranslation('common');

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useMarketStore.persist.rehydrate();
  }, []);

  return (
    <>
      <PageTitle title={t('tab.market')} />
      <AgentSearchBar />
    </>
  );
});

export default Market;
