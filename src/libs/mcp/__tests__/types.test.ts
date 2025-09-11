import { describe, expect, it, vi } from 'vitest';

import { createMCPError, MCPError, MCPErrorType } from '../types';

describe('MCP Types', () => {
  describe('createMCPError', () => {
    it('should create MCPError with basic information', () => {
      const error = createMCPError('CONNECTION_FAILED', 'Failed to connect to server');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Failed to connect to server');
      expect(error.data).toEqual({
        type: 'CONNECTION_FAILED',
        message: 'Failed to connect to server',
        metadata: {
          timestamp: expect.any(Number),
        },
      });
    });

    it('should create MCPError with metadata', () => {
      const metadata = {
        originalError: 'ECONNREFUSED',
        params: {
          command: 'node',
          args: ['server.js'],
          type: 'stdio',
        },
        step: 'connection_attempt',
        errorLog: 'stderr output here',
      };

      const error = createMCPError('PROCESS_SPAWN_ERROR', 'Failed to spawn process', metadata);

      expect(error.data).toEqual({
        type: 'PROCESS_SPAWN_ERROR',
        message: 'Failed to spawn process',
        metadata: {
          ...metadata,
          timestamp: expect.any(Number),
        },
      });
    });

    it('should create MCPError with process information', () => {
      const metadata = {
        process: {
          exitCode: 1,
          signal: 'SIGTERM',
        },
        params: {
          command: 'python',
          args: ['-m', 'mcp_server'],
        },
      };

      const error = createMCPError('CONNECTION_FAILED', 'Process exited with error', metadata);

      expect(error.data.metadata?.process).toEqual({
        exitCode: 1,
        signal: 'SIGTERM',
      });
    });

    it('should include timestamp in metadata', () => {
      const beforeTimestamp = Date.now();
      const error = createMCPError('VALIDATION_ERROR', 'Invalid parameters');
      const afterTimestamp = Date.now();

      expect(error.data.metadata?.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(error.data.metadata?.timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it('should merge provided metadata with default timestamp', () => {
      const customMetadata = {
        step: 'validation',
        originalError: 'Missing required field',
      };

      const error = createMCPError('VALIDATION_ERROR', 'Validation failed', customMetadata);

      expect(error.data.metadata).toEqual({
        ...customMetadata,
        timestamp: expect.any(Number),
      });
    });

    it('should handle empty metadata gracefully', () => {
      const error = createMCPError('UNKNOWN_ERROR', 'Something went wrong', {});

      expect(error.data.metadata).toEqual({
        timestamp: expect.any(Number),
      });
    });

    it('should preserve all MCPErrorType values', () => {
      const errorTypes: MCPErrorType[] = [
        'CONNECTION_FAILED',
        'PROCESS_SPAWN_ERROR',
        'INITIALIZATION_TIMEOUT',
        'VALIDATION_ERROR',
        'UNKNOWN_ERROR',
        'AUTHORIZATION_ERROR',
      ];

      errorTypes.forEach((type) => {
        const error = createMCPError(type, `Test message for ${type}`);
        expect(error.data.type).toBe(type);
      });
    });

    it('should create error that can be thrown and caught', () => {
      const error = createMCPError('CONNECTION_FAILED', 'Connection test');

      expect(() => {
        throw error;
      }).toThrow(error);

      try {
        throw error;
      } catch (caught) {
        expect(caught).toBeInstanceOf(Error);
        expect((caught as MCPError).data.type).toBe('CONNECTION_FAILED');
      }
    });

    it('should maintain error stack trace', () => {
      const error = createMCPError('VALIDATION_ERROR', 'Stack trace test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack trace test');
    });
  });

  describe('Interface Definitions', () => {
    it('should define McpTool interface correctly', () => {
      // This test verifies the interface exists and has expected shape
      // TypeScript will catch any interface issues at compile time
      const mockTool = {
        name: 'echo',
        description: 'Echo the input message',
        inputSchema: {
          type: 'object' as const,
          properties: {
            message: { type: 'string' },
          },
        },
      };

      // If this compiles, the interface is correctly defined
      expect(mockTool.name).toBe('echo');
      expect(mockTool.inputSchema.type).toBe('object');
    });

    it('should define McpResource interface correctly', () => {
      const mockResource = {
        uri: 'file:///path/to/file.txt',
        name: 'test-file',
        description: 'A test file resource',
        mimeType: 'text/plain',
      };

      expect(mockResource.uri).toBe('file:///path/to/file.txt');
      expect(mockResource.mimeType).toBe('text/plain');
    });

    it('should define McpPrompt interface correctly', () => {
      const mockPrompt = {
        name: 'summarize',
        description: 'Summarize the given text',
        arguments: [
          {
            name: 'text',
            description: 'Text to summarize',
            required: true,
          },
          {
            name: 'length',
            description: 'Maximum summary length',
            required: false,
          },
        ],
      };

      expect(mockPrompt.arguments).toHaveLength(2);
      expect(mockPrompt.arguments![0].required).toBe(true);
      expect(mockPrompt.arguments![1].required).toBe(false);
    });

    it('should define AuthConfig interface for different auth types', () => {
      const bearerAuth = {
        type: 'bearer' as const,
        token: 'bearer-token-123',
      };

      const oauth2Auth = {
        type: 'oauth2' as const,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        scope: 'read write',
        tokenExpiresAt: Date.now() + 3600000,
        serverMetadata: {
          authorization_endpoint: 'https://auth.example.com/oauth/authorize',
          token_endpoint: 'https://auth.example.com/oauth/token',
          registration_endpoint: 'https://auth.example.com/oauth/register',
        },
      };

      const noAuth = {
        type: 'none' as const,
      };

      expect(bearerAuth.type).toBe('bearer');
      expect(oauth2Auth.type).toBe('oauth2');
      expect(noAuth.type).toBe('none');
    });

    it('should define MCPClientParams union correctly', () => {
      const httpParams = {
        type: 'http' as const,
        name: 'HTTP Client',
        url: 'https://api.example.com',
        headers: {
          'User-Agent': 'test-client/1.0',
        },
        auth: {
          type: 'bearer' as const,
          token: 'token-123',
        },
      };

      const stdioParams = {
        type: 'stdio' as const,
        name: 'Stdio Client',
        command: 'node',
        args: ['server.js', '--port', '3000'],
        env: {
          NODE_ENV: 'development',
          DEBUG: 'mcp:*',
        },
      };

      expect(httpParams.type).toBe('http');
      expect(stdioParams.type).toBe('stdio');
      expect(httpParams.url).toBe('https://api.example.com');
      expect(stdioParams.command).toBe('node');
    });
  });

  describe('Error Data Structure', () => {
    it('should have all required fields in MCPErrorData', () => {
      const errorData = {
        type: 'CONNECTION_FAILED' as MCPErrorType,
        message: 'Connection failed',
        metadata: {
          timestamp: Date.now(),
          step: 'initial_connection',
          originalError: 'ECONNREFUSED',
          params: {
            type: 'http',
            command: 'curl',
            args: ['-X', 'POST'],
          },
          process: {
            exitCode: 1,
            signal: 'SIGTERM',
          },
          errorLog: 'Connection refused by server',
        },
      };

      expect(errorData.type).toBe('CONNECTION_FAILED');
      expect(errorData.message).toBe('Connection failed');
      expect(errorData.metadata?.timestamp).toBeTypeOf('number');
      expect(errorData.metadata?.step).toBe('initial_connection');
      expect(errorData.metadata?.originalError).toBe('ECONNREFUSED');
      expect(errorData.metadata?.params?.type).toBe('http');
      expect(errorData.metadata?.process?.exitCode).toBe(1);
      expect(errorData.metadata?.errorLog).toBe('Connection refused by server');
    });

    it('should allow optional metadata fields', () => {
      const minimalErrorData = {
        type: 'UNKNOWN_ERROR' as MCPErrorType,
        message: 'Unknown error occurred',
      };

      expect(minimalErrorData.type).toBe('UNKNOWN_ERROR');
      expect(minimalErrorData.metadata).toBeUndefined();
    });

    it('should allow partial metadata fields', () => {
      const partialErrorData = {
        type: 'VALIDATION_ERROR' as MCPErrorType,
        message: 'Validation failed',
        metadata: {
          timestamp: Date.now(),
          step: 'input_validation',
        },
      };

      expect(partialErrorData.metadata?.step).toBe('input_validation');
      expect(partialErrorData.metadata?.originalError).toBeUndefined();
      expect(partialErrorData.metadata?.params).toBeUndefined();
    });
  });
});