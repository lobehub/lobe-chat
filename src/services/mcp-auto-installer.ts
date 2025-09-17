import { McpConfig } from '@/plugins/types';
import { mcpService } from '@/services/mcp';
import { pluginService } from '@/services/plugin';
import { useToolStore } from '@/store/tool';

/**
 * Auto-installs multiple MCP plugins from configuration array
 */
export const autoInstallMcpPlugins = async (configs: McpConfig[]): Promise<boolean> => {
  try {
    // Check which plugins are already installed
    const installedPlugins = await pluginService.getInstalledPlugins();
    const installedIdentifiers = new Set(installedPlugins.map((p) => p.identifier));

    let successCount = 0;
    let totalCount = configs.length;

    for (const config of configs) {
      // Skip if already installed
      if (installedIdentifiers.has(config.identifier)) {
        console.log(`MCP plugin "${config.identifier}" already installed, skipping`);
        successCount++;
        continue;
      }

      try {
        console.log(`Auto-installing MCP plugin: ${config.identifier}`);

        // Fetch manifest from MCP server
        let manifest;

        if (config.type === 'http' && config.url) {
          manifest = await mcpService.getStreamableMcpServerManifest({
            headers: config.headers,
            identifier: config.identifier,
            metadata: config.metadata,
            url: config.url,
          });
        } else if (config.type === 'stdio' && config.command) {
          manifest = await mcpService.getStdioMcpServerManifest(
            {
              args: config.args || [],
              command: config.command,
              env: config.env || {},
              name: config.identifier,
            },
            config.metadata,
          );
        } else {
          console.error(`Invalid MCP config for "${config.identifier}": missing required fields`);
          continue;
        }

        // Create the plugin with fetched manifest
        const pluginData = {
          customParams: {
            avatar: config.metadata.avatar,
            description: config.metadata.description,
            mcp: {
              args: config.args,
              command: config.command,
              env: config.env,
              headers: config.headers,
              type: config.type,
              url: config.url,
            },
          },
          identifier: config.identifier,
          manifest,
          settings: config.env || {},
          type: 'customPlugin' as const,
        };

        // Install the plugin
        await pluginService.createCustomPlugin(pluginData);
        successCount++;

        console.log(`MCP plugin "${config.identifier}" auto-installed successfully`);
      } catch (error) {
        console.error(`Failed to auto-install MCP plugin "${config.identifier}":`, error);
      }
    }

    // Refresh plugins list if any were installed
    if (successCount > 0) {
      await useToolStore.getState().refreshPlugins();
      console.log(`Successfully auto-installed ${successCount}/${totalCount} MCP plugins`);
    }

    return successCount > 0;
  } catch (error) {
    console.error('Failed to auto-install MCP plugins:', error);
    return false;
  }
};
