'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ResponsiveContainer from '@/components/ResponsiveContainer';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import Footer from './features/Footer';
import Showcase from './features/Showcase';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default memo(() => (
  <ResponsiveContainer Mobile={Mobile}>
    <Layout>
      <Showcase />
      <Footer />
    </Layout>
  </ResponsiveContainer>
));
