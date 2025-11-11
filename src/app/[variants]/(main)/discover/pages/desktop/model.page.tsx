'use client';

import { memo } from 'react';

import ModelLayout from '../../(list)/model/ModelLayout';
import ModelPage from '../../(list)/model/ModelPage';

/**
 * Desktop Discover Model List Page
 */
export const DesktopDiscoverModelPage = memo(() => {
  return (
    <ModelLayout mobile={false}>
      <ModelPage mobile={false} />
    </ModelLayout>
  );
});

DesktopDiscoverModelPage.displayName = 'DesktopDiscoverModelPage';
