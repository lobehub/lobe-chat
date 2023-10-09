'use client';

import { memo } from 'react';

import ResponsiveIndex from '@/components/ResponsiveIndex';

import Mobile from '../(mobile)';
import Common from '../common';
import Layout from './layout.responsive';

export default memo(() => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <Common />
    </Layout>
  </ResponsiveIndex>
));
