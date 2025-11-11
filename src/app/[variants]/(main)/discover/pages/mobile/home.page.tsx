'use client';

import { memo } from 'react';

import HomePage from '../../(list)/(home)/HomePage';

/**
 * Mobile Discover Home Page
 * Homepage showing featured assistants and MCP servers
 */
export const MobileDiscoverHomePage = memo(() => {
  return <HomePage mobile={true} />;
});

MobileDiscoverHomePage.displayName = 'MobileDiscoverHomePage';
