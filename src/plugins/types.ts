export interface McpConfig {
  // Stdio MCP server config
  args?: string[];
  command?: string;
  env?: Record<string, string>;
  // HTTP MCP server config
  headers?: Record<string, string>;
  identifier: string;
  metadata: {
    avatar: string;
    description: string;
  };
  type: 'http' | 'stdio';
  url?: string;
}
