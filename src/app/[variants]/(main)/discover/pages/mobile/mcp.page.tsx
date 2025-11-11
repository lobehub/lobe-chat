'use client';

import { memo } from 'react';

import McpLayout from '../../(list)/mcp/McpLayout';
import McpPage from '../../(list)/mcp/McpPage';

/**
 * Mobile Discover MCP Server List Page
 */
export const MobileDiscoverMcpPage = memo(() => {
  return (
    <McpLayout mobile={true}>
      <McpPage mobile={true} />
    </McpLayout>
  );
});

MobileDiscoverMcpPage.displayName = 'MobileDiscoverMcpPage';
