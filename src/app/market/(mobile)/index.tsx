'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentCard from '../features/AgentCard';
import Index from '../index';
import CardRender from './features/AgentCard';

const DetailModal = dynamic(() => import('./features/AgentDetail'), { ssr: false });

export default memo(() => (
  <>
    <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
      <Index />
      <AgentCard CardRender={CardRender} mobile />{' '}
    </Flexbox>
    <DetailModal />
  </>
));
