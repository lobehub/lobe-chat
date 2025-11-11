'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import NProgress from '@/components/NProgress';

import Container from '../../_layout/Desktop/Container';
import Header from '../../_layout/Desktop/Header';

/**
 * Desktop Discover Layout
 * Provides the container and header for all discover pages
 */
export const DesktopDiscoverLayout = memo(() => {
  return (
    <>
      <NProgress />
      <Container>
        <Header />
        <Outlet />
      </Container>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
    </>
  );
});

DesktopDiscoverLayout.displayName = 'DesktopDiscoverLayout';
