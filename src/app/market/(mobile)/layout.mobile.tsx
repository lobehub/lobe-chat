'use client';

import dynamic from 'next/dynamic';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

const DetailModal = dynamic(() => import('./features/AgentDetail'));

const MarketLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        {children}
      </Flexbox>
      <DetailModal />
    </>
  );
};

export default MarketLayout;
