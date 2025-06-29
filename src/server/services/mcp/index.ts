import { LobeChatPluginApi, LobeChatPluginManifest, PluginSchema } from '@lobehub/chat-plugin-sdk';
import { DeploymentOption } from '@lobehub/market-sdk';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { TRPCError } from '@trpc/server';
import debug from 'debug';

import {
  MCPClient,
  MCPClientParams,
  McpPrompt,
  McpResource,
  McpTool,
  StdioMCPParams,
} from '@/libs/mcp';
import { mcpSystemDepsCheckService } from '@/server/services/mcp/deps';
import { CheckMcpInstallResult } from '@/types/plugins';
import { CustomPluginMetadata } from '@/types/tool/plugin';
import { safeParseJSON } from '@/utils/safeParseJSON';

const log = debug('lobe-mcp:service');

// Removed MCPConnection interface as it's no longer needed

class MCPService {
  // Store instances of the custom MCPClient, keyed by serialized MCPClientParams
  private clients: Map<string, MCPClient> = new Map();

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

  // listTools now accepts MCPClientParams
  async listRawTools(params: MCPClientParams): Promise<McpTool[]> {
    const client = await this.getClient(params); // Get client using params
    log(`Listing tools using client for params: %O`, params);

    try {
      const result = await client.listTools();
      log(`Tools listed successfully for params: %O, result count: %d`, params, result.length);
      return result;
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

  // listResources now accepts MCPClientParams
  async listResources(params: MCPClientParams): Promise<McpResource[]> {
    const client = await this.getClient(params); // Get client using params
    log(`Listing resources using client for params: %O`, params);

    try {
      const result = await client.listResources();
      log(`Resources listed successfully for params: %O, result count: %d`, params, result.length);
      return result;
    } catch (error) {
      console.error(`Error listing resources for params %O:`, params, error);
      // Propagate a TRPCError for better handling upstream
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error listing resources from MCP server: ${(error as Error).message}`,
      });
    }
  }

  // listPrompts now accepts MCPClientParams
  async listPrompts(params: MCPClientParams): Promise<McpPrompt[]> {
    const client = await this.getClient(params); // Get client using params
    log(`Listing prompts using client for params: %O`, params);

    try {
      const result = await client.listPrompts();
      log(`Prompts listed successfully for params: %O, result count: %d`, params, result.length);
      return result;
    } catch (error) {
      console.error(`Error listing prompts for params %O:`, params, error);
      // Propagate a TRPCError for better handling upstream
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error listing prompts from MCP server: ${(error as Error).message}`,
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

      if (isError) return result;

      const data = content as { text: string; type: 'text' }[];

      const text = data?.[0]?.text;

      if (!text) return data;

      // try to get json object, which will be stringify in the client
      const json = safeParseJSON(text);
      if (json) return json;

      return text;
    } catch (error) {
      if (error instanceof McpError) {
        const mcpError = error as McpError;

        return mcpError.message;
      }

      console.error(`Error calling tool "${toolName}" for params %O:`, params, error);
      // Propagate a TRPCError
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error calling tool "${toolName}" on MCP server: ${(error as Error).message}`,
      });
    }
  }

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
      const client = new MCPClient(params);
      await client.initialize({
        onProgress: (progress) => {
          log(`New client initializing... ${progress.progress}/${progress.total}`);
        },
      }); // Initialization logic should be within MCPClient
      this.clients.set(key, client);
      log(`New client initialized and cached for key: ${key}`);
      return client;
    } catch (error) {
      console.error(`Failed to initialize MCP client for key ${key}:`, error);
      // Do not cache failed initializations
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to initialize MCP client, reason: ${(error as Error).message}`,
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
    metadata?: CustomPluginMetadata,
  ): Promise<LobeChatPluginManifest> {
    const tools = await this.listTools({ name: identifier, type: 'http', url }); // Get client using params

    return {
      api: tools,
      identifier,
      meta: {
        avatar: metadata?.avatar || 'MCP_AVATAR',
        description:
          metadata?.description ||
          `${identifier} MCP server has ${tools.length} tools, like "${tools[0]?.name}"`,
        title: identifier,
      },
      // TODO: temporary
      type: 'mcp' as any,
    };
  }

  async getStdioMcpServerManifest(
    params: Omit<StdioMCPParams, 'type'>,
    metadata?: CustomPluginMetadata,
  ): Promise<LobeChatPluginManifest> {
    const client = await this.getClient({
      args: params.args,
      command: params.command,
      env: params.env,
      name: params.name,
      type: 'stdio',
    }); // Get client using params

    const apis = await this.listTools({
      args: params.args,
      command: params.command,
      env: params.env,
      name: params.name,
      type: 'stdio',
    });

    const manifest = await client.listManifests();

    const identifier = params.name;

    return {
      api: apis,
      identifier,
      meta: {
        avatar: metadata?.avatar || 'MCP_AVATAR',
        description:
          metadata?.description ||
          `${identifier} MCP server has ${apis.length} tools, like "${apis[0]?.name}"`,
        title: identifier,
      },
      ...manifest,
      // TODO: temporary
      type: 'mcp' as any,
    } as LobeChatPluginManifest;
  }

  /**
   * Check MCP plugin installation status
   */
  async checkMcpInstall(input: {
    deploymentOptions: DeploymentOption[];
  }): Promise<CheckMcpInstallResult> {
    try {
      log('Checking MCP plugin installation status: %O', input);
      const results = [];

      // 检查每个部署选项
      for (const option of input.deploymentOptions) {
        // 使用系统依赖检查服务检查部署选项
        const result = await mcpSystemDepsCheckService.checkDeployOption(option);
        results.push(result);
      }

      // 找出推荐的或第一个可安装的选项
      const recommendedResult = results.find((r) => r.isRecommended && r.allDependenciesMet);
      const firstInstallableResult = results.find((r) => r.allDependenciesMet);

      // 返回推荐的结果，或第一个可安装的结果，或第一个结果
      const bestResult = recommendedResult || firstInstallableResult || results[0];

      log('Check completed, best result: %O', bestResult);

      return {
        ...bestResult,
        allOptions: results,
        success: true,
      };
    } catch (error) {
      log('Check failed: %O', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error when checking MCP plugin installation status',
        success: false,
      };
    }
  }
}

// Export a singleton instance
export const mcpService = new MCPService();
