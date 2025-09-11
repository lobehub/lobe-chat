import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { spawn } from 'node:child_process';

import { MCPClient } from '../client';
import { createMCPError } from '../types';

// Mock debug
const mockLog = vi.fn();
vi.mock('debug', () => ({
  default: () => mockLog,
}));

// Mock SDK components
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn(),
}));

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn(),
  getDefaultEnvironment: vi.fn(() => ({ NODE_ENV: 'test' })),
}));

vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: vi.fn(),
}));

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    spawn: vi.fn(),
  };
});

describe('MCPClient', () => {
  let mockClient: any;
  let mockTransport: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      connect: vi.fn(),
      listTools: vi.fn(),
      listResources: vi.fn(),
      listPrompts: vi.fn(),
      callTool: vi.fn(),
      getServerCapabilities: vi.fn(),
      getServerVersion: vi.fn(),
      disconnect: vi.fn(),
    };

    mockTransport = {
      close: vi.fn(),
    };

    vi.mocked(Client).mockImplementation(() => mockClient);
    vi.mocked(StdioClientTransport).mockImplementation(() => mockTransport);
    vi.mocked(StreamableHTTPClientTransport).mockImplementation(() => mockTransport);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor - HTTP transport', () => {
    it('should create HTTP client with basic configuration', () => {
      const params = {
        type: 'http' as const,
        name: 'Test HTTP Client',
        url: 'https://api.example.com/mcp',
      };

      const client = new MCPClient(params);

      expect(Client).toHaveBeenCalledWith({
        name: 'lobehub-mcp-client',
        version: '1.0.0',
      });

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://api.example.com/mcp'),
        {
          requestInit: { headers: {} },
        },
      );
    });

    it('should create HTTP client with custom headers', () => {
      const params = {
        type: 'http' as const,
        name: 'Test HTTP Client',
        url: 'https://api.example.com/mcp',
        headers: {
          'X-Custom-Header': 'custom-value',
          'Content-Type': 'application/json',
        },
      };

      new MCPClient(params);

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://api.example.com/mcp'),
        {
          requestInit: {
            headers: {
              'X-Custom-Header': 'custom-value',
              'Content-Type': 'application/json',
            },
          },
        },
      );
    });

    it('should handle Bearer token authentication', () => {
      const params = {
        type: 'http' as const,
        name: 'Test HTTP Client',
        url: 'https://api.example.com/mcp',
        auth: {
          type: 'bearer' as const,
          token: 'bearer-token-123',
        },
      };

      new MCPClient(params);

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://api.example.com/mcp'),
        {
          requestInit: {
            headers: {
              Authorization: 'Bearer bearer-token-123',
            },
          },
        },
      );

      expect(mockLog).toHaveBeenCalledWith('Added Bearer token authentication');
    });

    it('should handle OAuth2 authentication', () => {
      const params = {
        type: 'http' as const,
        name: 'Test HTTP Client',
        url: 'https://api.example.com/mcp',
        auth: {
          type: 'oauth2' as const,
          accessToken: 'oauth2-access-token-123',
        },
      };

      new MCPClient(params);

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://api.example.com/mcp'),
        {
          requestInit: {
            headers: {
              Authorization: 'Bearer oauth2-access-token-123',
            },
          },
        },
      );

      expect(mockLog).toHaveBeenCalledWith('Added OAuth2 access token authentication');
    });

    it('should handle no authentication', () => {
      const params = {
        type: 'http' as const,
        name: 'Test HTTP Client',
        url: 'https://api.example.com/mcp',
        auth: {
          type: 'none' as const,
        },
      };

      new MCPClient(params);

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://api.example.com/mcp'),
        {
          requestInit: { headers: {} },
        },
      );
    });

    it('should merge custom headers with auth headers', () => {
      const params = {
        type: 'http' as const,
        name: 'Test HTTP Client',
        url: 'https://api.example.com/mcp',
        headers: {
          'X-Custom': 'custom-value',
        },
        auth: {
          type: 'bearer' as const,
          token: 'token-123',
        },
      };

      new MCPClient(params);

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://api.example.com/mcp'),
        {
          requestInit: {
            headers: {
              'X-Custom': 'custom-value',
              Authorization: 'Bearer token-123',
            },
          },
        },
      );
    });
  });

  describe('constructor - Stdio transport', () => {
    it('should create Stdio client with basic configuration', () => {
      const params = {
        type: 'stdio' as const,
        name: 'Test Stdio Client',
        command: 'node',
        args: ['server.js'],
      };

      new MCPClient(params);

      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: 'node',
        args: ['server.js'],
        env: { NODE_ENV: 'test' },
      });
    });

    it('should create Stdio client with custom environment', () => {
      const params = {
        type: 'stdio' as const,
        name: 'Test Stdio Client',
        command: 'python',
        args: ['-m', 'mcp_server'],
        env: {
          CUSTOM_VAR: 'custom-value',
          DEBUG: '1',
        },
      };

      new MCPClient(params);

      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: 'python',
        args: ['-m', 'mcp_server'],
        env: {
          NODE_ENV: 'test',
          CUSTOM_VAR: 'custom-value',
          DEBUG: '1',
        },
      });
    });
  });

  describe('constructor - unsupported transport', () => {
    it('should throw error for unsupported connection type', () => {
      const params = {
        type: 'websocket' as any,
        name: 'Test Client',
      };

      expect(() => new MCPClient(params)).toThrow(
        createMCPError(
          'VALIDATION_ERROR',
          'Unsupported MCP connection type: websocket',
          {
            params: { type: 'websocket' },
          },
        ),
      );
    });
  });

  describe('initialize', () => {
    let client: MCPClient;

    beforeEach(() => {
      const params = {
        type: 'http' as const,
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      };
      client = new MCPClient(params);
    });

    it('should initialize connection successfully', async () => {
      mockClient.connect.mockResolvedValue(undefined);

      await client.initialize();

      expect(mockClient.connect).toHaveBeenCalledWith(mockTransport, { onprogress: undefined });
      expect(mockLog).toHaveBeenCalledWith('MCP connection initialized.');
    });

    it('should handle progress callback', async () => {
      const onProgress = vi.fn();
      mockClient.connect.mockResolvedValue(undefined);

      await client.initialize({ onProgress });

      expect(mockClient.connect).toHaveBeenCalledWith(mockTransport, { onprogress: onProgress });
    });

    it('should handle HTTP 401 errors', async () => {
      const httpClient = new MCPClient({
        type: 'http',
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      });

      mockClient.connect.mockRejectedValue(new Error('401 Unauthorized'));

      await expect(httpClient.initialize()).rejects.toThrow(
        createMCPError('AUTHORIZATION_ERROR', '401 Unauthorized'),
      );
    });

    it('should handle stdio connection errors with pre-check', async () => {
      const stdioClient = new MCPClient({
        type: 'stdio',
        name: 'Test Client',
        command: 'nonexistent-command',
        args: [],
      });

      mockClient.connect.mockRejectedValue({ code: -32000 });

      // Mock spawn for pre-check
      const mockChild = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        stdin: { write: vi.fn(), end: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
      };

      vi.mocked(spawn).mockReturnValue(mockChild as any);

      // Simulate spawn error
      setTimeout(() => {
        const errorHandler = mockChild.on.mock.calls.find((call) => call[0] === 'error')?.[1];
        if (errorHandler) errorHandler(new Error('ENOENT'));
      }, 0);

      await expect(stdioClient.initialize()).rejects.toThrow();
    });

    it('should handle unknown connection errors', async () => {
      mockClient.connect.mockRejectedValue(new Error('Unknown error'));

      await expect(client.initialize()).rejects.toThrow(
        createMCPError('UNKNOWN_ERROR', 'Unknown error'),
      );
    });
  });

  describe('disconnect', () => {
    let client: MCPClient;

    beforeEach(() => {
      const params = {
        type: 'http' as const,
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      };
      client = new MCPClient(params);
    });

    it('should disconnect MCP client', async () => {
      mockClient.disconnect = vi.fn().mockResolvedValue(undefined);

      await client.disconnect();

      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalledWith('MCP connection disconnected.');
    });

    it('should close transport when client has no disconnect method', async () => {
      mockClient.disconnect = undefined;

      await client.disconnect();

      expect(mockTransport.close).toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalledWith('Transport closed.');
    });
  });

  describe('listTools', () => {
    let client: MCPClient;

    beforeEach(() => {
      const params = {
        type: 'http' as const,
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      };
      client = new MCPClient(params);
    });

    it('should list tools successfully', async () => {
      const mockTools = [
        {
          name: 'echo',
          description: 'Echo input',
          inputSchema: { type: 'object', properties: { message: { type: 'string' } } },
        },
      ];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });

      const tools = await client.listTools();

      expect(tools).toEqual(mockTools);
      expect(mockLog).toHaveBeenCalledWith('Listed tools: %O', mockTools);
    });

    it('should return empty array on error', async () => {
      mockClient.listTools.mockRejectedValue(new Error('Connection failed'));

      const tools = await client.listTools();

      expect(tools).toEqual([]);
      expect(mockLog).toHaveBeenCalledWith('Listed tools error: %O', expect.any(Error));
    });
  });

  describe('listResources', () => {
    let client: MCPClient;

    beforeEach(() => {
      const params = {
        type: 'http' as const,
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      };
      client = new MCPClient(params);
    });

    it('should list resources successfully', async () => {
      const mockResources = [
        {
          uri: 'file:///test.txt',
          name: 'test file',
          description: 'A test file',
          mimeType: 'text/plain',
        },
      ];

      mockClient.listResources.mockResolvedValue({ resources: mockResources });

      const resources = await client.listResources();

      expect(resources).toEqual(mockResources);
      expect(mockLog).toHaveBeenCalledWith('Listed resources: %O', mockResources);
    });

    it('should return empty array on error', async () => {
      mockClient.listResources.mockRejectedValue(new Error('Connection failed'));

      const resources = await client.listResources();

      expect(resources).toEqual([]);
      expect(mockLog).toHaveBeenCalledWith('Listed resources: %O', expect.any(Error));
    });
  });

  describe('listPrompts', () => {
    let client: MCPClient;

    beforeEach(() => {
      const params = {
        type: 'http' as const,
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      };
      client = new MCPClient(params);
    });

    it('should list prompts successfully', async () => {
      const mockPrompts = [
        {
          name: 'summarize',
          description: 'Summarize text',
          arguments: [{ name: 'text', required: true }],
        },
      ];

      mockClient.listPrompts.mockResolvedValue({ prompts: mockPrompts });

      const prompts = await client.listPrompts();

      expect(prompts).toEqual(mockPrompts);
      expect(mockLog).toHaveBeenCalledWith('Listed prompts: %O', mockPrompts);
    });

    it('should return empty array on error', async () => {
      mockClient.listPrompts.mockRejectedValue(new Error('Connection failed'));

      const prompts = await client.listPrompts();

      expect(prompts).toEqual([]);
      expect(mockLog).toHaveBeenCalledWith('Listed prompts: %O', expect.any(Error));
    });
  });

  describe('listManifests', () => {
    let client: MCPClient;

    beforeEach(() => {
      const params = {
        type: 'http' as const,
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      };
      client = new MCPClient(params);
    });

    it('should compile manifests from all lists', async () => {
      const mockTools = [{ name: 'echo', description: 'Echo tool' }];
      const mockResources = [{ uri: 'file:///test.txt', name: 'test' }];
      const mockPrompts = [{ name: 'summarize', description: 'Summarize prompt' }];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });
      mockClient.listResources.mockResolvedValue({ resources: mockResources });
      mockClient.listPrompts.mockResolvedValue({ prompts: mockPrompts });
      mockClient.getServerCapabilities.mockReturnValue({ tools: {}, resources: {}, prompts: {} });
      mockClient.getServerVersion.mockReturnValue({ title: 'Test Server', version: 'v1.0.0' });

      const manifest = await client.listManifests();

      expect(manifest).toEqual({
        tools: mockTools,
        resources: mockResources,
        prompts: mockPrompts,
        title: 'Test Server',
        version: '1.0.0',
      });
    });

    it('should exclude empty arrays from manifest', async () => {
      mockClient.listTools.mockResolvedValue({ tools: [] });
      mockClient.listResources.mockResolvedValue({ resources: [] });
      mockClient.listPrompts.mockResolvedValue({ prompts: [] });
      mockClient.getServerCapabilities.mockReturnValue({});
      mockClient.getServerVersion.mockReturnValue({ title: 'Empty Server', version: 'v2.0.0' });

      const manifest = await client.listManifests();

      expect(manifest).toEqual({
        tools: undefined,
        resources: undefined,
        prompts: undefined,
        title: 'Empty Server',
        version: '2.0.0',
      });
    });

    it('should strip v prefix from version', async () => {
      mockClient.listTools.mockResolvedValue({ tools: [] });
      mockClient.listResources.mockResolvedValue({ resources: [] });
      mockClient.listPrompts.mockResolvedValue({ prompts: [] });
      mockClient.getServerCapabilities.mockReturnValue({});
      mockClient.getServerVersion.mockReturnValue({ version: 'v1.2.3' });

      const manifest = await client.listManifests();

      expect(manifest.version).toBe('1.2.3');
    });

    it('should handle missing server info gracefully', async () => {
      mockClient.listTools.mockResolvedValue({ tools: [] });
      mockClient.listResources.mockResolvedValue({ resources: [] });
      mockClient.listPrompts.mockResolvedValue({ prompts: [] });
      mockClient.getServerCapabilities.mockReturnValue({});
      mockClient.getServerVersion.mockReturnValue(null);

      const manifest = await client.listManifests();

      expect(manifest.title).toBeUndefined();
      expect(manifest.version).toBeUndefined();
    });
  });

  describe('callTool', () => {
    let client: MCPClient;

    beforeEach(() => {
      const params = {
        type: 'http' as const,
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      };
      client = new MCPClient(params);
    });

    it('should call tool with correct parameters', async () => {
      const mockResult = {
        content: [{ type: 'text', text: 'Tool executed successfully' }],
      };

      mockClient.callTool.mockResolvedValue(mockResult);

      const result = await client.callTool('echo', { message: 'Hello' });

      expect(mockClient.callTool).toHaveBeenCalledWith(
        {
          name: 'echo',
          arguments: { message: 'Hello' },
        },
        undefined,
        { timeout: 60_000 },
      );

      expect(result).toEqual(mockResult);
      expect(mockLog).toHaveBeenCalledWith(
        'Calling tool: %s with args: %O, timeout: %O',
        'echo',
        { message: 'Hello' },
        60_000,
      );
    });

    it('should use custom timeout from environment', async () => {
      // Mock environment variable
      const originalEnv = process.env.MCP_TOOL_TIMEOUT;
      process.env.MCP_TOOL_TIMEOUT = '30000';

      // Need to reimport the module to pick up new env var
      const { MCPClient: MCPClientWithCustomTimeout } = await import('../client');

      const clientWithTimeout = new MCPClientWithCustomTimeout({
        type: 'http',
        name: 'Test Client',
        url: 'https://api.example.com/mcp',
      });

      const mockResult = { content: [{ type: 'text', text: 'Success' }] };
      mockClient.callTool.mockResolvedValue(mockResult);

      await clientWithTimeout.callTool('test-tool', {});

      expect(mockClient.callTool).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
        { timeout: 30_000 },
      );

      // Restore original env
      if (originalEnv !== undefined) {
        process.env.MCP_TOOL_TIMEOUT = originalEnv;
      } else {
        delete process.env.MCP_TOOL_TIMEOUT;
      }
    });

    it('should handle invalid timeout environment variable', () => {
      const originalEnv = process.env.MCP_TOOL_TIMEOUT;
      process.env.MCP_TOOL_TIMEOUT = 'invalid';

      // The timeout should fallback to default
      expect(() => {
        new MCPClient({
          type: 'http',
          name: 'Test Client',
          url: 'https://api.example.com/mcp',
        });
      }).not.toThrow();

      // Restore original env
      if (originalEnv !== undefined) {
        process.env.MCP_TOOL_TIMEOUT = originalEnv;
      } else {
        delete process.env.MCP_TOOL_TIMEOUT;
      }
    });
  });

  describe('preCheckStdioCommand', () => {
    it('should handle successful pre-check', async () => {
      const mockChild = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        stdin: { write: vi.fn(), end: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
      };

      vi.mocked(spawn).mockReturnValue(mockChild as any);

      // Simulate successful exit
      setTimeout(() => {
        const exitHandler = mockChild.on.mock.calls.find((call) => call[0] === 'exit')?.[1];
        if (exitHandler) exitHandler(0, null);
      }, 0);

      const stdioClient = new MCPClient({
        type: 'stdio',
        name: 'Test Client',
        command: 'test-command',
        args: ['--test'],
      });

      mockClient.connect.mockRejectedValue({ code: -32000 });

      // This should not throw since pre-check succeeds
      await expect(stdioClient.initialize()).rejects.toThrow(
        createMCPError('CONNECTION_FAILED', expect.any(String)),
      );
    });

    it('should handle pre-check timeout', async () => {
      const mockChild = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        stdin: { write: vi.fn(), end: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
      };

      vi.mocked(spawn).mockReturnValue(mockChild as any);

      // Don't trigger any handlers to simulate timeout

      const stdioClient = new MCPClient({
        type: 'stdio',
        name: 'Test Client',
        command: 'slow-command',
        args: [],
      });

      mockClient.connect.mockRejectedValue({ code: -32000 });

      await expect(stdioClient.initialize()).rejects.toThrow(
        createMCPError('INITIALIZATION_TIMEOUT', expect.any(String)),
      );
    });

    it('should handle pre-check process exit with error code', async () => {
      const mockChild = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        stdin: { write: vi.fn(), end: vi.fn() },
        on: vi.fn(),
        kill: vi.fn(),
      };

      vi.mocked(spawn).mockReturnValue(mockChild as any);

      // Simulate process exit with error
      setTimeout(() => {
        const stderrHandler = mockChild.stderr.on.mock.calls.find((call) => call[0] === 'data')?.[1];
        if (stderrHandler) stderrHandler('Error message from stderr');

        const exitHandler = mockChild.on.mock.calls.find((call) => call[0] === 'exit')?.[1];
        if (exitHandler) exitHandler(1, null);
      }, 0);

      const stdioClient = new MCPClient({
        type: 'stdio',
        name: 'Test Client',
        command: 'failing-command',
        args: [],
      });

      mockClient.connect.mockRejectedValue({ code: -32000 });

      await expect(stdioClient.initialize()).rejects.toThrow(
        createMCPError('CONNECTION_FAILED', 'MCP service startup failed'),
      );
    });
  });
});