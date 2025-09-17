import { McpConfig } from './types';

/**
 * Configuration for MCP plugins to auto-install
 * Add your MCP server configurations here
 */
export const MCP_CONFIG: McpConfig[] = [
  // Bazak.ai MCP Server - Israeli e-commerce search
  {
    headers: {
      'Accept': 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'User-Agent': 'LobeChat/1.0 MCP-Client',
    },
    identifier: 'zap-mcp',
    metadata: {
      avatar: '🛒',
      description: 'Search Israeli e-commerce products using Bazak.ai MCP server',
    },
    type: 'http',
    url: 'https://mcp.bazak.ai/3afb3754-8d6e-4414-b0e3-5ff0f29065e9/mcp?bazak-api-key=40a4278f-3417-40fb-a383-0ca1cce9f4e1',
  },

  // Add more MCP server configurations here
  // Example stdio MCP server:
  // {
  //   identifier: 'my-stdio-mcp',
  //   metadata: {
  //     avatar: '⚙️',
  //     description: 'My custom stdio MCP server',
  //   },
  //   type: 'stdio',
  //   command: 'node',
  //   args: ['path/to/my-mcp-server.js'],
  //   env: {
  //     'MY_API_KEY': 'your-api-key-here',
  //   },
  // },

  // Example HTTP MCP server:
  // {
  //   identifier: 'my-http-mcp',
  //   metadata: {
  //     avatar: '🌐',
  //     description: 'My custom HTTP MCP server',
  //   },
  //   type: 'http',
  //   url: 'https://my-mcp-server.com/mcp',
  //   headers: {
  //     'Authorization': 'Bearer your-token-here',
  //   },
  // },
];
