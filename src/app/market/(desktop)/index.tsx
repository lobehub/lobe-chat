'use client';

import { SpotlightCard, SpotlightCardProps } from '@lobehub/ui';
import { FC, memo, useEffect } from 'react';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';
import { useMarketStore } from '@/store/market';

import AgentCard from '../features/AgentCard';
import AgentSearchBar from '../features/AgentSearchBar';

const Desktop = memo(() => {
  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useMarketStore.persist.rehydrate();
  }, []);

  return (
    <>
      <AgentSearchBar />
      <AgentCard CardRender={SpotlightCard as FC<SpotlightCardProps>} />
    </>
  );
});

export default ClientResponsiveContent({ Desktop, Mobile: () => import('../(mobile)') });
