import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MCPClient } from '../index';

// Mock the SDK modules
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    listTools: vi.fn().mockResolvedValue({
      tools: [
        { name: 'echo', description: 'Echoes a message' },
        { name: 'add', description: 'Adds two numbers' },
        { name: 'hello', description: 'Says hello' },
      ],
    }),
    callTool: vi.fn().mockImplementation(({ name, arguments: args }) => {
      switch (name) {
        case 'echo':
          return Promise.resolve({
            content: [{ type: 'text', text: `You said: ${args.message}` }],
          });
        case 'add':
          return Promise.resolve({
            content: [{ type: 'text', text: `The sum is: ${args.a + args.b}` }],
          });
        default:
          return Promise.reject(new Error(`Unknown tool: ${name}`));
      }
    }),
  })),
}));

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn().mockImplementation(() => ({
    // Mock transport methods if needed
  })),
}));

vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: vi.fn().mockImplementation(() => ({
    // Mock transport methods if needed
  })),
}));

describe('MCPClient', () => {
  describe('Stdio Transport', () => {
    let mcpClient: MCPClient;
    const stdioConnection = {
      id: 'mcp-hello-world',
      name: 'Stdio SDK Test Connection',
      type: 'stdio' as const,
      command: 'npx',
      args: ['mcp-hello-world@1.1.2'],
    };

    beforeEach(() => {
      mcpClient = new MCPClient(stdioConnection);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should create and initialize an instance with stdio transport', async () => {
      await mcpClient.initialize();
      expect(mcpClient).toBeInstanceOf(MCPClient);
    });

    it('should list tools via stdio', async () => {
      await mcpClient.initialize();
      const result = await mcpClient.listTools();

      expect(result.tools).toHaveLength(3);
      expect(result.tools).toEqual([
        { name: 'echo', description: 'Echoes a message' },
        { name: 'add', description: 'Adds two numbers' },
        { name: 'hello', description: 'Says hello' },
      ]);
    });

    it('should call the "echo" tool via stdio', async () => {
      await mcpClient.initialize();
      const toolName = 'echo';
      const toolArgs = { message: 'hello stdio' };
      const expectedResult = {
        content: [{ type: 'text', text: 'You said: hello stdio' }],
      };

      const result = await mcpClient.callTool(toolName, toolArgs);
      expect(result).toEqual(expectedResult);
    });

    it('should call the "add" tool via stdio', async () => {
      await mcpClient.initialize();
      const toolName = 'add';
      const toolArgs = { a: 5, b: 7 };

      const result = await mcpClient.callTool(toolName, toolArgs);
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The sum is: 12' }],
      });
    });
  });

  describe('HTTP Transport', () => {
    let mcpClient: MCPClient;
    const httpConnection = {
      id: 'http-test',
      name: 'HTTP Test Connection',
      type: 'http' as const,
      url: 'http://localhost:3000',
    };

    beforeEach(() => {
      mcpClient = new MCPClient(httpConnection);
    });

    it('should create and initialize an instance with HTTP transport', async () => {
      await mcpClient.initialize();
      expect(mcpClient).toBeInstanceOf(MCPClient);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported connection type', () => {
      const connection = {
        id: 'invalid-test',
        name: 'Invalid Test Connection',
        type: 'invalid' as any,
      };
      expect(() => new MCPClient(connection as any)).toThrow(
        'Unsupported MCP connection type: invalid',
      );
    });
  });
});
