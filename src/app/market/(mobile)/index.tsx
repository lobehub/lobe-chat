'use client';

import dynamic from 'next/dynamic';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMarketStore } from '@/store/market';

import AgentCard from '../features/AgentCard';
import AgentSearchBar from '../features/AgentSearchBar';
import CardRender from './features/AgentCard';

const DetailModal = dynamic(() => import('./features/AgentDetail'), { ssr: false });

export default memo(() => {
  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useMarketStore.persist.rehydrate();
  }, []);

  return (
    <>
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        <AgentSearchBar mobile />
        <AgentCard CardRender={CardRender} mobile />{' '}
      </Flexbox>
      <DetailModal />
    </>
  );
});
