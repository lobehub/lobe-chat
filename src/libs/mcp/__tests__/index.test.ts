import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MCPClient } from '../index';

const mockConnect = vi.fn();
const mockListTools = vi.fn();
const mockListResources = vi.fn();
const mockListPrompts = vi.fn();
const mockCallTool = vi.fn();
const mockDisconnect = vi.fn();

const mockTools = [
  {
    description: 'Echo back the provided message.',
    inputSchema: {
      properties: {
        message: { type: 'string' },
      },
      required: ['message'],
      type: 'object',
    },
    name: 'echo',
  },
  {
    description: 'Add two numeric values.',
    inputSchema: {
      properties: {
        a: { type: 'number' },
        b: { type: 'number' },
      },
      required: ['a', 'b'],
      type: 'object',
    },
    name: 'add',
  },
  {
    description: 'Multiply two numeric values.',
    inputSchema: {
      properties: {
        a: { type: 'number' },
        b: { type: 'number' },
      },
      required: ['a', 'b'],
      type: 'object',
    },
    name: 'multiply',
  },
];

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    callTool: mockCallTool,
    connect: mockConnect,
    disconnect: mockDisconnect,
    getServerCapabilities: () => ({}),
    getServerVersion: () => ({ title: 'Mock Server', version: 'v1.0.0' }),
    listPrompts: mockListPrompts,
    listResources: mockListResources,
    listTools: mockListTools,
  })),
}));

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn().mockImplementation((config) => ({ config })),
  getDefaultEnvironment: vi.fn(() => ({})),
}));

describe('MCPClient', () => {
  describe('Stdio Transport', () => {
    let mcpClient: MCPClient;

    const stdioConnection = {
      args: ['mock-server'],
      command: 'node',
      id: 'mcp-stdio',
      name: 'Mock Stdio Connection',
      type: 'stdio' as const,
    };

    beforeEach(async () => {
      mockConnect.mockReset();
      mockListTools.mockReset();
      mockListResources.mockReset();
      mockListPrompts.mockReset();
      mockCallTool.mockReset();
      mockDisconnect.mockReset();

      mockConnect.mockResolvedValue(undefined);
      mockListTools.mockResolvedValue({ tools: mockTools });
      mockListResources.mockResolvedValue({ resources: [] });
      mockListPrompts.mockResolvedValue({ prompts: [] });
      mockCallTool.mockImplementation(
        async ({ name, arguments: args }: { arguments: Record<string, unknown>; name: string }) => {
          switch (name) {
            case 'echo': {
              return {
                content: [{ text: `You said: ${String(args.message)}`, type: 'text' }],
              };
            }
            case 'add': {
              const a = Number(args.a ?? 0);
              const b = Number(args.b ?? 0);
              return {
                content: [{ text: `The sum is: ${a + b}`, type: 'text' }],
              };
            }
            case 'multiply': {
              const a = Number(args.a ?? 0);
              const b = Number(args.b ?? 0);
              return {
                content: [{ text: `The product is: ${a * b}`, type: 'text' }],
              };
            }
            default:
              return { content: [] };
          }
        },
      );

      mcpClient = new MCPClient(stdioConnection);
      await mcpClient.initialize();
    });

    afterEach(() => {
      mockConnect.mockReset();
      mockListTools.mockReset();
      mockListResources.mockReset();
      mockListPrompts.mockReset();
      mockCallTool.mockReset();
      mockDisconnect.mockReset();
    });

    it('should create and initialize an instance with stdio transport', () => {
      expect(mcpClient).toBeInstanceOf(MCPClient);
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should list tools via stdio', async () => {
      const result = await mcpClient.listTools();

      expect(mockListTools).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTools);
    });

    it('should call the "echo" tool via stdio', async () => {
      const result = await mcpClient.callTool('echo', { message: 'hello stdio' });

      expect(mockCallTool).toHaveBeenCalledWith(
        { arguments: { message: 'hello stdio' }, name: 'echo' },
        undefined,
        { timeout: expect.any(Number) },
      );
      expect(result).toEqual({
        content: [{ text: 'You said: hello stdio', type: 'text' }],
      });
    });

    it('should call the "add" tool via stdio', async () => {
      const result = await mcpClient.callTool('add', { a: 5, b: 7 });

      expect(mockCallTool).toHaveBeenCalledWith(
        { arguments: { a: 5, b: 7 }, name: 'add' },
        undefined,
        { timeout: expect.any(Number) },
      );
      expect(result).toEqual({
        content: [{ text: 'The sum is: 12', type: 'text' }],
      });
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
