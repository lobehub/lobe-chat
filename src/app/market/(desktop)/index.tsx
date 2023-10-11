'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import { AgentCardProps } from '@/app/market/features/AgentCard';
import ResponsiveIndex from '@/components/ResponsiveIndex';

import Index from '../index';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)')) as FC;
export default memo<AgentCardProps>((props) => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <Index {...props} />
    </Layout>
  </ResponsiveIndex>
));
