'use client';

import { memo } from 'react';

import AgentCard from '@/app/market/features/AgentCard';
import { AgentsMarketIndexItem } from '@/types/market';

import Index from '../index';
import CardRender from './features/AgentCard';
import Layout from './layout.mobile';

export default memo<{ defaultAgents?: AgentsMarketIndexItem[] }>(({ defaultAgents }) => (
  <Layout>
    <Index />
    <AgentCard CardRender={CardRender} defaultAgents={defaultAgents} mobile />
  </Layout>
));
