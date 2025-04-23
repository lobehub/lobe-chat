import { LobeChatPluginApi, LobeChatPluginManifest, PluginSchema } from '@lobehub/chat-plugin-sdk';
import { TRPCError } from '@trpc/server';
import debug from 'debug';

import { MCPClient, MCPClientParams } from '@/libs/mcp';
import { safeParseJSON } from '@/utils/safeParseJSON';

const log = debug('lobe-mcp:service');

// Removed MCPConnection interface as it's no longer needed

class MCPService {
  // Store instances of the custom MCPClient, keyed by serialized MCPClientParams
  private clients: Map<string, MCPClient> = new Map();

  constructor() {
    log('MCPService initialized');
  }

  // --- MCP Interaction ---

  // listTools now accepts MCPClientParams
  async listTools(params: MCPClientParams): Promise<LobeChatPluginApi[]> {
    const client = await this.getClient(params); // Get client using params
    log(`Listing tools using client for params: %O`, params);

    try {
      const result = await client.listTools();
      log(`Tools listed successfully for params: %O, result count: %d`, params, result.length);
      return result.map<LobeChatPluginApi>((item) => ({
        // Assuming identifier is the unique name/id
        description: item.description,
        name: item.name,
        parameters: item.inputSchema as PluginSchema,
      }));
    } catch (error) {
      console.error(`Error listing tools for params %O:`, params, error);
      // Propagate a TRPCError for better handling upstream
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error listing tools from MCP server: ${(error as Error).message}`,
      });
    }
  }

  // callTool now accepts MCPClientParams, toolName, and args
  async callTool(params: MCPClientParams, toolName: string, argsStr: any): Promise<any> {
    const client = await this.getClient(params); // Get client using params

    const args = safeParseJSON(argsStr);

    log(`Calling tool "${toolName}" using client for params: %O with args: %O`, params, args);

    try {
      // Delegate the call to the MCPClient instance
      const result = await client.callTool(toolName, args); // Pass args directly
      log(`Tool "${toolName}" called successfully for params: %O, result: %O`, params, result);
      const { content, isError } = result;
      if (!isError) return content;

      return result;
    } catch (error) {
      console.error(`Error calling tool "${toolName}" for params %O:`, params, error);
      // Propagate a TRPCError
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error calling tool "${toolName}" on MCP server: ${(error as Error).message}`,
      });
    }
  }

  // TODO: Consider adding methods for managing the client lifecycle if needed,
  // e.g., explicitly closing clients on shutdown or after inactivity,
  // although for serverless, on-demand creation/retrieval might be sufficient.

  // TODO: Implement methods like listResources, getResource, listPrompts, getPrompt if needed,
  // following the pattern of accepting MCPClientParams.

  // --- Client Management (Replaces Connection Management) ---

  // Private method to get or initialize a client based on parameters
  private async getClient(params: MCPClientParams): Promise<MCPClient> {
    const key = this.serializeParams(params); // Use custom serialization
    log(`Attempting to get client for key: ${key} (params: %O)`, params);

    if (this.clients.has(key)) {
      log(`Returning cached client for key: ${key}`);
      return this.clients.get(key)!;
    }

    log(`No cached client found for key: ${key}. Initializing new client.`);
    try {
      // Ensure stdio is only attempted in desktop/server environments within the client itself
      // or add a check here if MCPClient doesn't handle it.
      // Example check (adjust based on where environment check is best handled):
      // if (params.type === 'stdio' && typeof window !== 'undefined') {
      //   throw new Error('Stdio MCP type is not supported in browser environment.');
      // }

      const client = new MCPClient(params);
      await client.initialize(); // Initialization logic should be within MCPClient
      this.clients.set(key, client);
      log(`New client initialized and cached for key: ${key}`);
      return client;
    } catch (error) {
      console.error(`Failed to initialize MCP client for key ${key}:`, error);
      // Do not cache failed initializations
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to initialize MCP client: ${(error as Error).message}`,
      });
    }
  }

  // Custom serialization function to ensure consistent keys
  private serializeParams(params: MCPClientParams): string {
    const sortedKeys = Object.keys(params).sort();
    const sortedParams: Record<string, any> = {};

    for (const key of sortedKeys) {
      const value = (params as any)[key];
      // Sort the 'args' array if it exists
      if (key === 'args' && Array.isArray(value)) {
        sortedParams[key] = JSON.stringify(key);
      } else {
        sortedParams[key] = value;
      }
    }

    return JSON.stringify(sortedParams);
  }

  async getStreamableMcpServerManifest(
    identifier: string,
    url: string,
  ): Promise<LobeChatPluginManifest> {
    const tools = await this.listTools({ name: identifier, type: 'http', url }); // Get client using params

    return {
      api: tools,
      identifier,
      meta: {
        avatar: 'MCP_AVATAR',
        description: `${identifier} MCP server has ${tools.length} tools, like "${tools[0]?.name}"`,
        title: identifier,
      },
      // TODO: temporary
      type: 'mcp' as any,
    };
  }
  async getStdioMcpServerManifest(
    identifier: string,
    command: string,
    args: string[],
  ): Promise<LobeChatPluginManifest> {
    const tools = await this.listTools({ args, command, name: identifier, type: 'stdio' }); // Get client using params

    return {
      api: tools,
      identifier,
      meta: {
        avatar: 'MCP_AVATAR',
        description: `${identifier} MCP server has ${tools.length} tools, like "${tools[0]?.name}"`,
        title: identifier,
      },
      // TODO: temporary
      type: 'mcp' as any,
    };
  }
}

// Export a singleton instance
export const mcpService = new MCPService();
