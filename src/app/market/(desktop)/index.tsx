'use client';

import { SpotlightCard, SpotlightCardProps } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ResponsiveContainer from '@/components/ResponsiveContainer';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import AgentCard from '../features/AgentCard';
import Index from '../index';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default memo(() => (
  <ResponsiveContainer Mobile={Mobile}>
    <Layout>
      <Index />
      <AgentCard CardRender={SpotlightCard as FC<SpotlightCardProps>} />
    </Layout>
  </ResponsiveContainer>
));
