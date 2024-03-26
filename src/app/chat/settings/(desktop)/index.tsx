'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';
import { HEADER_HEIGHT } from '@/const/layoutTokens';

import EditPage from '../features/EditPage';
import Header from './Header';

const Desktop = memo(() => (
  <>
    <Header />
    <Flexbox align={'center'} flex={1} gap={16} padding={24} style={{ overflow: 'scroll' }}>
      <SafeSpacing height={HEADER_HEIGHT - 16} />
      <EditPage />
    </Flexbox>
  </>
));

export default ClientResponsiveContent({ Desktop, Mobile: () => import('../(mobile)') });
