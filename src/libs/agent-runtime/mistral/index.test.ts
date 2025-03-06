// @vitest-environment node
import { Mock, afterEach, beforeEach, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeMistralAI } from './index';

testProvider({
  provider: 'mistral',
  defaultBaseURL: 'https://api.mistral.ai/v1',
  chatModel: 'open-mistral-7b',
  Runtime: LobeMistralAI,
  chatDebugEnv: 'DEBUG_MISTRAL_CHAT_COMPLETION',

  test: {
    skipAPICall: true,
  },
});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeMistralAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('specific LobeMistralAI tests', () => {
  it(`should call API with corresponding options`, async () => {
    // Arrange
    const mockStream = new ReadableStream();
    const mockResponse = Promise.resolve(mockStream);

    (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

    // Act
    const result = await instance.chat({
      max_tokens: 1024,
      messages: [{ content: 'Hello', role: 'user' }],
      model: 'open-mistral-7b',
      temperature: 0.7,
      top_p: 1,
    });

    // Assert
    expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
      {
        max_tokens: 1024,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'open-mistral-7b',
        stream: true,
        stream_options: {
          include_usage: true,
        },
        temperature: 0.35,
        top_p: 1,
      },
      { headers: { Accept: '*/*' } },
    );
    expect(result).toBeInstanceOf(Response);
  });
});
