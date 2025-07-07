import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.d.ts';
import type { Progress } from '@modelcontextprotocol/sdk/types.js';
import debug from 'debug';

import { MCPClientParams, McpTool } from './types';

const log = debug('lobe-mcp:client');
// MCP tool call timeout (milliseconds), configurable via the environment variable MCP_TOOL_TIMEOUT, default is 60000
// Parse MCP_TOOL_TIMEOUT, only use if it's a valid positive number, otherwise fallback to default 60000
const MCP_TOOL_TIMEOUT = (() => {
  const val = Number(process.env.MCP_TOOL_TIMEOUT);
  return Number.isFinite(val) && val > 0 ? val : 60_000;
})();

export class MCPClient {
  private mcp: Client;
  private transport: Transport;

  constructor(params: MCPClientParams) {
    log('Creating MCPClient with connection: %O', params);
    this.mcp = new Client({ name: 'lobehub-mcp-client', version: '1.0.0' });

    switch (params.type) {
      case 'http': {
        log('Using HTTP transport with url: %s', params.url);
        this.transport = new StreamableHTTPClientTransport(new URL(params.url));
        break;
      }
      case 'stdio': {
        log('Using Stdio transport with command: %s and args: %O', params.command, params.args);

        this.transport = new StdioClientTransport({
          args: params.args,
          command: params.command,
          env: {
            ...getDefaultEnvironment(),
            ...params.env,
          },
        });
        break;
      }
      default: {
        const err = new Error(`Unsupported MCP connection type: ${(params as any).type}`);
        log('Error creating client: %O', err);
        throw err;
      }
    }
  }

  async initialize(options: { onProgress?: (progress: Progress) => void } = {}) {
    log('Initializing MCP connection...');

    try {
      await this.mcp.connect(this.transport, { onprogress: options.onProgress });
      log('MCP connection initialized.');
    } catch (e) {
      if ((e as any).code === -32_000) {
        throw new Error('Fail to connecting MCP Server, please check your configuration.');
      }

      log('MCP connection failed:', e);
      throw e;
    }
  }

  async disconnect() {
    log('Disconnecting MCP connection...');
    // Assuming the mcp client has a disconnect method
    if (this.mcp && typeof (this.mcp as any).disconnect === 'function') {
      await (this.mcp as any).disconnect();
      log('MCP connection disconnected.');
    } else {
      log('MCP client does not have a disconnect method or is not initialized.');
      // Depending on the transport, we might need specific cleanup
      if (this.transport && typeof (this.transport as any).close === 'function') {
        (this.transport as any).close();
        log('Transport closed.');
      }
    }
  }

  async listTools() {
    log('Listing tools...');
    const { tools } = await this.mcp.listTools();
    log('Listed tools: %O', tools);
    return tools as McpTool[];
  }

  async callTool(toolName: string, args: any) {
    log('Calling tool: %s with args: %O, timeout: %O', toolName, args, MCP_TOOL_TIMEOUT);
    const result = await this.mcp.callTool({ arguments: args, name: toolName }, undefined, {
      timeout: MCP_TOOL_TIMEOUT,
    });
    log('Tool call result: %O', result);
    return result;
  }
}
