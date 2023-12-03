import OpenAI, { APIError } from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createChatCompletion } from './createChatCompletion';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('createChatCompletion', () => {
  let openaiInstance: OpenAI;

  beforeEach(() => {
    openaiInstance = new OpenAI({ apiKey: 'test', dangerouslyAllowBrowser: true });

    // 使用 vi.spyOn 来模拟 chat.completions.create 方法
    vi.spyOn(openaiInstance.chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return a StreamingTextResponse on successful API call', async () => {
    // Arrange
    const mockStream = new ReadableStream();
    const mockResponse = Promise.resolve(mockStream);

    (openaiInstance.chat.completions.create as Mock).mockResolvedValue(mockResponse);

    // Act
    const result = await createChatCompletion({
      openai: openaiInstance,
      payload: {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      },
    });

    // Assert
    expect(result).toBeInstanceOf(Response); // 注意这里的改动
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

    vi.spyOn(openaiInstance.chat.completions, 'create').mockRejectedValue(apiError);

    // Act
    const result = await createChatCompletion({
      openai: openaiInstance,
      payload: {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      },
    });

    // Assert
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(577); // Your custom error status code
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

    vi.spyOn(openaiInstance.chat.completions, 'create').mockRejectedValue(apiError);

    // Act
    const result = await createChatCompletion({
      openai: openaiInstance,
      payload: {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      },
    });

    // Assert
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(577); // Your custom error status code

    const content = await result.json();
    expect(content.body).toHaveProperty('endpoint');
    expect(content.body.error).toEqual(errorInfo);
  });

  it('should return a 500 error response for non-OpenAI errors', async () => {
    // Arrange
    const genericError = new Error('Generic Error');

    vi.spyOn(openaiInstance.chat.completions, 'create').mockRejectedValue(genericError);

    // Act
    const result = await createChatCompletion({
      openai: openaiInstance,
      payload: {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      },
    });

    // Assert
    expect(result.status).toBe(500);
    const content = await result.json();
    expect(content.body).toHaveProperty('endpoint');
    expect(content.body).toHaveProperty('error');
  });
});
