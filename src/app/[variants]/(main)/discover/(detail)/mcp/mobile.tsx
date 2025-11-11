'use client';

import { memo } from 'react';

import McpDetailPage from '../../(detail)/mcp/McpDetailPage';

/**
 * Mobile Discover MCP Server Detail Page
 */
export const MobileDiscoverMcpDetailPage = memo(() => {
  return <McpDetailPage mobile={true} />;
});

MobileDiscoverMcpDetailPage.displayName = 'MobileDiscoverMcpDetailPage';
