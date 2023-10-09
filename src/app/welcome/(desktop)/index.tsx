'use client';

import { memo } from 'react';

import ResponsiveIndex from '@/components/ResponsiveIndex';

import Mobile from '../(mobile)';
import Footer from './features/Footer';
import Showcase from './features/Showcase';
import Layout from './layout.responsive';

export default memo(() => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <Showcase />
      <Footer />
    </Layout>
  </ResponsiveIndex>
));
