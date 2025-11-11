'use client';

import { memo } from 'react';

import McpLayout from '../../(list)/mcp/McpLayout';
import McpPage from '../../(list)/mcp/McpPage';

/**
 * Desktop Discover MCP Server List Page
 */
export const DesktopDiscoverMcpPage = memo(() => {
  return (
    <McpLayout mobile={false}>
      <McpPage mobile={false} />
    </McpLayout>
  );
});

DesktopDiscoverMcpPage.displayName = 'DesktopDiscoverMcpPage';
