'use client';

import { SpotlightCard, SpotlightCardProps } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import AgentCard from '@/app/market/features/AgentCard';
import ResponsiveIndex from '@/components/ResponsiveIndex';

import Index from '../index';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

export default memo(() => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <Index />
      <AgentCard CardRender={SpotlightCard as FC<SpotlightCardProps>} />
    </Layout>
  </ResponsiveIndex>
));
