'use client';

import { memo } from 'react';

import ModelDetailPage from '../../(detail)/model/ModelDetailPage';

/**
 * Mobile Discover Model Detail Page
 */
export const MobileDiscoverModelDetailPage = memo(() => {
  return <ModelDetailPage mobile={true} />;
});

MobileDiscoverModelDetailPage.displayName = 'MobileDiscoverModelDetailPage';
