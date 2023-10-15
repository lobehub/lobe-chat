'use client';

import { SpotlightCard } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import AgentCard from '@/app/market/features/AgentCard';
import ResponsiveIndex from '@/components/ResponsiveIndex';
import { AgentsMarketIndexItem } from '@/types/market';

import Index from '../index';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

export default memo<{ defaultAgents?: AgentsMarketIndexItem[] }>(({ defaultAgents }) => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <Index />
      <AgentCard CardRender={SpotlightCard} defaultAgents={defaultAgents} />
    </Layout>
  </ResponsiveIndex>
));
