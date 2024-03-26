'use client';

import { memo } from 'react';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';

import EditPage from '../features/EditPage';
import Layout from './layout';

const Desktop = memo(() => (
  <Layout>
    <EditPage />
  </Layout>
));

export default ClientResponsiveContent({ Desktop, Mobile: () => import('../(mobile)') });
