'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ResponsiveIndex from '@/components/ResponsiveIndex';

import Footer from './features/Footer';
import Showcase from './features/Showcase';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

export default memo(() => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <Showcase />
      <Footer />
    </Layout>
  </ResponsiveIndex>
));
