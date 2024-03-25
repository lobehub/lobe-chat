'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import EditPage from '../features/EditPage';
import Layout from './layout';

const Desktop = memo(() => (
  <Layout>
    <EditPage />
  </Layout>
));

const Mobile = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default ClientResponsiveContent({ Desktop, Mobile });
