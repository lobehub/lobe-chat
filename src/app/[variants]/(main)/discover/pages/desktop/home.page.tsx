'use client';

import { memo } from 'react';

import HomePage from '../../(list)/(home)/HomePage';

/**
 * Desktop Discover Home Page
 * Homepage showing featured assistants and MCP servers
 */
export const DesktopDiscoverHomePage = memo(() => {
  return <HomePage mobile={false} />;
});

DesktopDiscoverHomePage.displayName = 'DesktopDiscoverHomePage';
