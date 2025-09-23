// @vitest-environment node
import { LobeOpenAICompatibleRuntime } from '@lobechat/model-runtime';
import { ModelProvider } from 'model-bank';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeBaichuanAI } from './index';

testProvider({
  Runtime: LobeBaichuanAI,
  provider: ModelProvider.Baichuan,
  defaultBaseURL: 'https://api.baichuan-ai.com/v1',
  chatDebugEnv: 'DEBUG_BAICHUAN_CHAT_COMPLETION',
  chatModel: 'hunyuan-lite',
  test: {
    skipAPICall: true,
  },
});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeBaichuanAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('specific LobeBaichuanAI tests', () => {
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
      stream: true,
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
