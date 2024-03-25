'use client';

import { SpotlightCard, SpotlightCardProps } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import AgentCard from '../features/AgentCard';
import Index from '../index';

const Desktop = memo(() => (
  <>
    <Index />
    <AgentCard CardRender={SpotlightCard as FC<SpotlightCardProps>} />
  </>
));

const Mobile = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default ClientResponsiveContent({ Desktop, Mobile });
