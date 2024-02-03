import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAI } from './index';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('LobeOpenAI chat', () => {
  let openaiInstance: LobeOpenAI;

  beforeEach(() => {
    openaiInstance = new LobeOpenAI({ apiKey: 'test', dangerouslyAllowBrowser: true });

    // 使用 vi.spyOn 来模拟 chat.completions.create 方法
    vi.spyOn(openaiInstance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (openaiInstance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await openaiInstance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    it('should return an openai error response when OpenAI.APIError is thrown', async () => {
      // Arrange
      const apiError = new OpenAI.APIError(
        400,
        {
          status: 400,
          error: {
            message: 'Bad Request',
          },
        },
        'Error message',
        {},
      );

      vi.spyOn(openaiInstance['client'].chat.completions, 'create').mockRejectedValue(apiError);

      // Act
      try {
        await openaiInstance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        });
      } catch (e) {
        expect(e).toEqual({
          endpoint: 'https://api.openai.com/v1',
          error: {
            error: { message: 'Bad Request' },
            status: 400,
          },
          errorType: 'OpenAIBizError',
          provider: 'openai',
        });
      }
    });

    it('should return an cause response when OpenAI.APIError is thrown with cause', async () => {
      // Arrange
      const errorInfo = {
        stack: 'abc',
        cause: {
          message: 'api is undefined',
        },
      };
      const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

      vi.spyOn(openaiInstance['client'].chat.completions, 'create').mockRejectedValue(apiError);

      // Act
      try {
        await openaiInstance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        });
      } catch (e) {
        expect(e).toEqual({
          endpoint: 'https://api.openai.com/v1',
          error: {
            cause: { message: 'api is undefined' },
            stack: 'abc',
          },
          errorType: 'OpenAIBizError',
          provider: 'openai',
        });
      }
    });

    it('should return an cause response with desensitize Url', async () => {
      // Arrange
      const errorInfo = {
        stack: 'abc',
        cause: { message: 'api is undefined' },
      };
      const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

      openaiInstance = new LobeOpenAI({
        apiKey: 'test',
        dangerouslyAllowBrowser: true,
        baseURL: 'https://api.abc.com/v1',
      });

      vi.spyOn(openaiInstance['client'].chat.completions, 'create').mockRejectedValue(apiError);

      // Act
      try {
        await openaiInstance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-3.5-turbo',
          temperature: 0,
        });
      } catch (e) {
        expect(e).toEqual({
          endpoint: 'https://api.***.com/v1',
          error: {
            cause: { message: 'api is undefined' },
            stack: 'abc',
          },
          errorType: 'OpenAIBizError',
          provider: 'openai',
        });
      }
    });

    it('should return a 500 error response for non-OpenAI errors', async () => {
      // Arrange
      const genericError = new Error('Generic Error');

      vi.spyOn(openaiInstance['client'].chat.completions, 'create').mockRejectedValue(genericError);

      // Act
      try {
        await openaiInstance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        });
      } catch (e) {
        expect(e).toEqual({
          endpoint: 'https://api.openai.com/v1',
          errorType: 'AgentRuntimeError',
          provider: 'openai',
          error: {
            name: genericError.name,
            cause: genericError.cause,
            message: genericError.message,
            stack: genericError.stack,
          },
        });
      }
    });
  });
});
