'use client';

import { memo } from 'react';

import ModelLayout from '../../(list)/model/ModelLayout';
import ModelPage from '../../(list)/model';

/**
 * Mobile Discover Model List Page
 */
export const MobileDiscoverModelPage = memo(() => {
  return (
    <ModelLayout mobile={true}>
      <ModelPage mobile={true} />
    </ModelLayout>
  );
});

MobileDiscoverModelPage.displayName = 'MobileDiscoverModelPage';
