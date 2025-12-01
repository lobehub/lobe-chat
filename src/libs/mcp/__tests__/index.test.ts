import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MCPClient } from '../index';

describe('MCPClient', () => {
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
    }, 30000);

    afterEach(async () => {
      // Assume SDK client/transport handles process termination gracefully
      // If processes leak, more explicit cleanup might be needed here
    }, 30000);

    it('should create and initialize an instance with stdio transport', () => {
      expect(mcpClient).toBeInstanceOf(MCPClient);
    }, 30000);

    it('should list tools via stdio', async () => {
      const result = await mcpClient.listTools();

      // Check exact length if no other tools are expected
      expect(result).toHaveLength(3);

      // Expect the tools defined in mock-sdk-server.ts
      expect(result).toMatchSnapshot();
    }, 30000);

    it('should call the "echo" tool via stdio', async () => {
      const toolName = 'echo';
      const toolArgs = { message: 'hello stdio' };
      // Expect the result format defined in mock-sdk-server.ts
      const expectedResult = {
        content: [{ type: 'text', text: 'You said: hello stdio' }],
      };

      const result = await mcpClient.callTool(toolName, toolArgs);
      expect(result).toEqual(expectedResult);
    }, 30000);

    it('should call the "add" tool via stdio', async () => {
      const toolName = 'add';
      const toolArgs = { a: 5, b: 7 };

      const result = await mcpClient.callTool(toolName, toolArgs);
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The sum is: 12' }],
      });
    }, 30000);
  });

  // Error Handling tests remain the same...
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
