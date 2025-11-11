'use client';

import { memo } from 'react';

import ProviderDetailPage from '../../(detail)/provider/ProviderDetailPage';

/**
 * Mobile Discover Provider Detail Page
 */
export const MobileDiscoverProviderDetailPage = memo(() => {
  return <ProviderDetailPage mobile={true} />;
});

MobileDiscoverProviderDetailPage.displayName = 'MobileDiscoverProviderDetailPage';
