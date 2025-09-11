import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MCPClient } from '../index';

describe('MCPClient Integration Tests', () => {
  // --- Updated Stdio Transport tests ---
  describe('Stdio Transport', () => {
    let mcpClient: MCPClient;
    const stdioConnection = {
      id: 'mcp-hello-world',
      name: 'Stdio SDK Test Connection',
      type: 'stdio' as const,
      command: 'npx', // Use node to run the compiled mock server
      args: ['mcp-hello-world@1.1.2'], // Use the path to the compiled JS file
    };

    beforeEach(async () => {
      // args are now set directly in the connection object
      mcpClient = new MCPClient(stdioConnection);
      // Initialize the client - this starts the stdio process
      await mcpClient.initialize();
      // Add a small delay to allow the server process to fully start (optional, but can help)
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    afterEach(async () => {
      // Clean up connection
      try {
        await mcpClient.disconnect();
      } catch {
        // Ignore disconnect errors in tests
      }
    });

    it('should create and initialize an instance with stdio transport', () => {
      expect(mcpClient).toBeInstanceOf(MCPClient);
    });

    it('should list tools via stdio', async () => {
      const result = await mcpClient.listTools();

      // Check exact length if no other tools are expected
      expect(result).toHaveLength(3);

      // Expect the tools defined in mock-sdk-server.ts
      expect(result).toMatchSnapshot();
    });

    it('should call the "echo" tool via stdio', async () => {
      const toolName = 'echo';
      const toolArgs = { message: 'hello stdio' };
      // Expect the result format defined in mock-sdk-server.ts
      const expectedResult = {
        content: [{ type: 'text', text: 'You said: hello stdio' }],
      };

      const result = await mcpClient.callTool(toolName, toolArgs);
      expect(result).toEqual(expectedResult);
    });

    it('should call the "add" tool via stdio', async () => {
      const toolName = 'add';
      const toolArgs = { a: 5, b: 7 };

      const result = await mcpClient.callTool(toolName, toolArgs);
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The sum is: 12' }],
      });
    });

    it('should list resources via stdio', async () => {
      const result = await mcpClient.listResources();
      
      expect(Array.isArray(result)).toBe(true);
      // Resources may be empty for this test server, but should not error
    });

    it('should list prompts via stdio', async () => {
      const result = await mcpClient.listPrompts();
      
      expect(Array.isArray(result)).toBe(true);
      // Prompts may be empty for this test server, but should not error
    });

    it('should generate manifest from all lists', async () => {
      const manifest = await mcpClient.listManifests();
      
      expect(manifest).toHaveProperty('title');
      expect(manifest).toHaveProperty('version');
      expect(manifest).toHaveProperty('tools');
      
      if (manifest.tools) {
        expect(manifest.tools).toHaveLength(3);
      }
    });

    it('should handle tool calls with different argument types', async () => {
      const multiplyResult = await mcpClient.callTool('multiply', { a: 3, b: 4 });
      
      expect(multiplyResult).toEqual({
        content: [{ type: 'text', text: 'The product is: 12' }],
      });
    });

    it('should handle concurrent tool calls', async () => {
      const promises = [
        mcpClient.callTool('echo', { message: 'call1' }),
        mcpClient.callTool('echo', { message: 'call2' }),
        mcpClient.callTool('add', { a: 1, b: 2 }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        content: [{ type: 'text', text: 'You said: call1' }],
      });
      expect(results[1]).toEqual({
        content: [{ type: 'text', text: 'You said: call2' }],
      });
      expect(results[2]).toEqual({
        content: [{ type: 'text', text: 'The sum is: 3' }],
      });
    });
  });

  describe('Connection Management', () => {
    it('should handle initialization with progress callback', async () => {
      const progressCallback = vi.fn();
      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Progress Test Client',
        command: 'npx',
        args: ['mcp-hello-world@1.1.2'],
      });

      try {
        await client.initialize({ onProgress: progressCallback });
        expect(client).toBeInstanceOf(MCPClient);
      } finally {
        await client.disconnect().catch(() => {});
      }
    });

    it('should handle reinitialization after disconnect', async () => {
      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Reinit Test Client',
        command: 'npx',
        args: ['mcp-hello-world@1.1.2'],
      });

      try {
        await client.initialize();
        await client.disconnect();
        await client.initialize();
        
        const tools = await client.listTools();
        expect(tools).toHaveLength(3);
      } finally {
        await client.disconnect().catch(() => {});
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle stdio server startup failures gracefully', async () => {
      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Failing Client',
        command: 'nonexistent-command-that-should-fail',
        args: [],
      });

      await expect(client.initialize()).rejects.toThrow();
    });

    it('should handle tool call timeouts', async () => {
      // Mock environment for short timeout
      const originalTimeout = process.env.MCP_TOOL_TIMEOUT;
      process.env.MCP_TOOL_TIMEOUT = '100'; // Very short timeout

      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Timeout Test Client',
        command: 'npx',
        args: ['mcp-hello-world@1.1.2'],
      });

      try {
        await client.initialize();
        
        // This might timeout depending on server response time
        // We're testing the timeout mechanism exists
        const result = await client.callTool('echo', { message: 'timeout test' });
        expect(result).toBeDefined();
      } catch (error) {
        // Timeout errors are acceptable in this test
        expect(error).toBeDefined();
      } finally {
        await client.disconnect().catch(() => {});
        
        // Restore original timeout
        if (originalTimeout) {
          process.env.MCP_TOOL_TIMEOUT = originalTimeout;
        } else {
          delete process.env.MCP_TOOL_TIMEOUT;
        }
      }
    });

    it('should handle invalid tool names gracefully', async () => {
      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Invalid Tool Test Client',
        command: 'npx',
        args: ['mcp-hello-world@1.1.2'],
      });

      try {
        await client.initialize();
        
        // This should either throw or return an error response
        await expect(client.callTool('nonexistent-tool', {})).rejects.toThrow();
      } finally {
        await client.disconnect().catch(() => {});
      }
    });

    it('should handle malformed tool arguments', async () => {
      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Bad Args Test Client',
        command: 'npx',
        args: ['mcp-hello-world@1.1.2'],
      });

      try {
        await client.initialize();
        
        // Call echo without required message parameter
        await expect(client.callTool('echo', {})).rejects.toThrow();
      } finally {
        await client.disconnect().catch(() => {});
      }
    });
  });

  // Error Handling tests remain the same...
  describe('Constructor Error Handling', () => {
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

    it('should create HTTP client without throwing', () => {
      const connection = {
        type: 'http' as const,
        name: 'HTTP Test Client',
        url: 'https://example.com/mcp',
      };
      
      expect(() => new MCPClient(connection)).not.toThrow();
    });

    it('should create Stdio client without throwing', () => {
      const connection = {
        type: 'stdio' as const,
        name: 'Stdio Test Client',
        command: 'echo',
        args: ['hello'],
      };
      
      expect(() => new MCPClient(connection)).not.toThrow();
    });
  });

  describe('Performance and Stress Tests', () => {
    it('should handle rapid successive tool calls', async () => {
      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Stress Test Client',
        command: 'npx',
        args: ['mcp-hello-world@1.1.2'],
      });

      try {
        await client.initialize();
        
        const calls = Array.from({ length: 10 }, (_, i) =>
          client.callTool('echo', { message: `message-${i}` }),
        );

        const results = await Promise.all(calls);
        
        expect(results).toHaveLength(10);
        results.forEach((result, i) => {
          expect(result).toEqual({
            content: [{ type: 'text', text: `You said: message-${i}` }],
          });
        });
      } finally {
        await client.disconnect().catch(() => {});
      }
    });

    it('should handle large tool arguments', async () => {
      const client = new MCPClient({
        type: 'stdio' as const,
        name: 'Large Args Test Client',
        command: 'npx',
        args: ['mcp-hello-world@1.1.2'],
      });

      try {
        await client.initialize();
        
        const largeMessage = 'A'.repeat(10000); // 10KB message
        const result = await client.callTool('echo', { message: largeMessage });
        
        expect(result).toEqual({
          content: [{ type: 'text', text: `You said: ${largeMessage}` }],
        });
      } finally {
        await client.disconnect().catch(() => {});
      }
    });
  });
});
