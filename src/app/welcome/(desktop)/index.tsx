'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import Footer from './features/Footer';
import Showcase from './features/Showcase';

const Desktop = memo(() => (
  <>
    <Showcase />
    <Footer />
  </>
));

const Mobile = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default ClientResponsiveContent({ Desktop, Mobile });
