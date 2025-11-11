'use client';

import { memo } from 'react';

import ProviderPage from '../../(list)/provider/ProviderPage';

/**
 * Mobile Discover Provider List Page
 */
export const MobileDiscoverProviderPage = memo(() => {
  return <ProviderPage mobile={true} />;
});

MobileDiscoverProviderPage.displayName = 'MobileDiscoverProviderPage';
