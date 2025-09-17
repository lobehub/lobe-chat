import { MCP_CONFIG as BAZAK_CONFIG } from './bazak-ai-mcp-plugin';
import { McpConfig } from './types';

/**
 * Combined configuration of all MCP plugins
 * This automatically includes all imported MCP plugin configurations
 */
export const ALL_MCP_PLUGINS_CONFIG: McpConfig[] = [
  ...BAZAK_CONFIG,
  // Add more plugin configs as needed
  // ...OTHER_CONFIG,
];

export const MCP_PLUGIN_IDENTIFIERS = ALL_MCP_PLUGINS_CONFIG.map((config) => config.identifier);
