'use client';

import { memo } from 'react';

import ProviderPage from '../../(list)/provider/ProviderPage';

/**
 * Desktop Discover Provider List Page
 */
export const DesktopDiscoverProviderPage = memo(() => {
  return <ProviderPage mobile={false} />;
});

DesktopDiscoverProviderPage.displayName = 'DesktopDiscoverProviderPage';
