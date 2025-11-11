'use client';

import { memo } from 'react';

import McpDetailPage from '../../(detail)/mcp/McpDetailPage';

/**
 * Desktop Discover MCP Server Detail Page
 */
export const DesktopDiscoverMcpDetailPage = memo(() => {
  return <McpDetailPage mobile={false} />;
});

DesktopDiscoverMcpDetailPage.displayName = 'DesktopDiscoverMcpDetailPage';
