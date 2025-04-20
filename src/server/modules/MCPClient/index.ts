import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.d.ts';
import debug from 'debug';

const log = debug('lobe-mcp:client');

interface MCPConnectionBase {
  id: string;
  name: string;
  type: 'http' | 'stdio';
}

interface HttpMCPConnection extends MCPConnectionBase {
  type: 'http';
  url: string;
}

interface StdioMCPConnection extends MCPConnectionBase {
  args: string[];
  command: string;
  type: 'stdio';
}
type MCPConnection = HttpMCPConnection | StdioMCPConnection;

export class MCPClient {
  private mcp: Client;
  private transport: Transport;

  constructor(connection: MCPConnection) {
    log('Creating MCPClient with connection: %O', connection);
    this.mcp = new Client({ name: 'lobehub-mcp-client', version: '1.0.0' });

    switch (connection.type) {
      case 'http': {
        log('Using HTTP transport with url: %s', connection.url);
        this.transport = new StreamableHTTPClientTransport(new URL(connection.url));
        break;
      }
      case 'stdio': {
        log('Using Stdio transport with command: %s and args: %O', connection.command, connection.args);
        this.transport = new StdioClientTransport({
          args: connection.args,
          command: connection.command,
        });
        break;
      }
      default: {
        const err = new Error(`Unsupported MCP connection type: ${(connection as any).type}`);
        log('Error creating client: %O', err);
        throw err;
      }
    }
  }

  async initialize() {
    log('Initializing MCP connection...');
    await this.mcp.connect(this.transport);
    log('MCP connection initialized.');
  }

  async listTools() {
    log('Listing tools...');
    const tools = await this.mcp.listTools();
    log('Listed tools: %O', tools);
    return tools;
  }

  async callTool(toolName: string, args: any) {
    log('Calling tool: %s with args: %O', toolName, args);
    const result = await this.mcp.callTool({ arguments: args, name: toolName });
    log('Tool call result: %O', result);
    return result;
  }
}
