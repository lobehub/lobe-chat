'use client';

import { SpotlightCard, SpotlightCardProps } from '@lobehub/ui';
import { FC, memo } from 'react';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';

import AgentCard from '../features/AgentCard';
import Index from '../index';

const Desktop = memo(() => (
  <>
    <Index />
    <AgentCard CardRender={SpotlightCard as FC<SpotlightCardProps>} />
  </>
));

export default ClientResponsiveContent({ Desktop, Mobile: () => import('../(mobile)') });
