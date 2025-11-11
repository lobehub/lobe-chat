'use client';

import { memo } from 'react';

import ProviderDetailPage from '../../(detail)/provider/ProviderDetailPage';

/**
 * Desktop Discover Provider Detail Page
 */
export const DesktopDiscoverProviderDetailPage = memo(() => {
  return <ProviderDetailPage mobile={false} />;
});

DesktopDiscoverProviderDetailPage.displayName = 'DesktopDiscoverProviderDetailPage';
