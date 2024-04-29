'use client';

import { memo } from 'react';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';

import Footer from './features/Footer';
import Showcase from './features/Showcase';

const Desktop = memo(() => (
  <>
    <Showcase />
    <Footer />
  </>
));

export default ClientResponsiveContent({ Desktop, Mobile: () => import('../(mobile)') });
