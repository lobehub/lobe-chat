import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock 依赖
vi.mock('@/libs/mcp');

describe('MCPService', () => {
  let mcpService: any;
  let mockClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // 动态导入服务实例
    const { mcpService: importedService } = await import('./index');
    mcpService = importedService;

    // 创建 mock 客户端
    mockClient = {
      callTool: vi.fn(),
    };

    // Mock getClient 方法返回 mock 客户端
    vi.spyOn(mcpService as any, 'getClient').mockResolvedValue(mockClient);
  });

  describe('callTool', () => {
    const mockParams = {
      name: 'test-mcp',
      type: 'stdio' as const,
      command: 'test-command',
      args: ['--test'],
    };

    it('should return original data when content array is empty', async () => {
      mockClient.callTool.mockResolvedValue({
        content: [],
        isError: false,
      });

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      expect(result).toEqual([]);
    });

    it('should return original data when content is null or undefined', async () => {
      mockClient.callTool.mockResolvedValue({
        content: null,
        isError: false,
      });

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      expect(result).toBeNull();
    });

    it('should return parsed JSON when single element contains valid JSON', async () => {
      const jsonData = { message: 'Hello World', status: 'success' };
      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(jsonData) }],
        isError: false,
      });

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      expect(result).toEqual(jsonData);
    });

    it('should return plain text when single element contains non-JSON text', async () => {
      const textData = 'Hello World';
      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: textData }],
        isError: false,
      });

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      expect(result).toBe(textData);
    });

    it('should return original data when single element has no text', async () => {
      const contentData = [{ type: 'text', text: '' }];
      mockClient.callTool.mockResolvedValue({
        content: contentData,
        isError: false,
      });

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      expect(result).toEqual(contentData);
    });

    it('should return complete array when content has multiple elements', async () => {
      const multipleContent = [
        { type: 'text', text: 'First message' },
        { type: 'text', text: 'Second message' },
        { type: 'text', text: '{"json": "data"}' },
      ];

      mockClient.callTool.mockResolvedValue({
        content: multipleContent,
        isError: false,
      });

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      // 应该直接返回完整的数组，不进行任何处理
      expect(result).toEqual(multipleContent);
    });

    it('should return complete array when content has two elements', async () => {
      const twoContent = [
        { type: 'text', text: 'First message' },
        { type: 'text', text: 'Second message' },
      ];

      mockClient.callTool.mockResolvedValue({
        content: twoContent,
        isError: false,
      });

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      expect(result).toEqual(twoContent);
    });

    it('should return error result when isError is true', async () => {
      const errorResult = {
        content: [{ type: 'text', text: 'Error occurred' }],
        isError: true,
      };

      mockClient.callTool.mockResolvedValue(errorResult);

      const result = await mcpService.callTool(mockParams, 'testTool', '{}');

      expect(result).toEqual(errorResult);
    });

    it('should throw TRPCError when client throws error', async () => {
      const error = new Error('MCP client error');
      mockClient.callTool.mockRejectedValue(error);

      await expect(mcpService.callTool(mockParams, 'testTool', '{}')).rejects.toThrow(TRPCError);
    });

    it('should parse args string correctly', async () => {
      const argsObject = { param1: 'value1', param2: 'value2' };
      const argsString = JSON.stringify(argsObject);

      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'result' }],
        isError: false,
      });

      await mcpService.callTool(mockParams, 'testTool', argsString);

      expect(mockClient.callTool).toHaveBeenCalledWith('testTool', argsObject);
    });
  });
});
