'use client';

import { memo } from 'react';

import ModelDetailPage from '../../(detail)/model/ModelDetailPage';

/**
 * Desktop Discover Model Detail Page
 */
export const DesktopDiscoverModelDetailPage = memo(() => {
  return <ModelDetailPage mobile={false} />;
});

DesktopDiscoverModelDetailPage.displayName = 'DesktopDiscoverModelDetailPage';
