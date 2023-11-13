'use client';

import { memo } from 'react';

import AgentCard from '@/app/market/features/AgentCard';

import Index from '../index';
import CardRender from './features/AgentCard';
import Layout from './layout.mobile';

export default memo(() => (
  <Layout>
    <Index />
    <AgentCard CardRender={CardRender} mobile />
  </Layout>
));
