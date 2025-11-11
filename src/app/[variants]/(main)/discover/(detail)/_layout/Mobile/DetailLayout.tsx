'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import { SCROLL_PARENT_ID } from '../../../features/const';
import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';

import Header from './Header';

/**
 * Mobile Discover Detail Layout
 * Layout for detail pages (assistant, model, provider, mcp details)
 */
export const MobileDiscoverDetailLayout = memo(() => {
  return (
    <MobileContentLayout gap={16} header={<Header />} id={SCROLL_PARENT_ID} padding={16}>
      <Outlet />
      <div />
      <Footer />
    </MobileContentLayout>
  );
});

MobileDiscoverDetailLayout.displayName = 'MobileDiscoverDetailLayout';
