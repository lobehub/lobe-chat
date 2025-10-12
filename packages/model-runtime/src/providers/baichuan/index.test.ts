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
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
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

  describe('handlePayload - custom features', () => {
    it('should add web_search tool when enabledSearch is true', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'Baichuan3-Turbo',
        enabledSearch: true,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.tools).toBeDefined();
      expect(calledPayload.tools?.some((tool: any) => tool.type === 'web_search')).toBe(true);
      expect(
        calledPayload.tools?.find((tool: any) => tool.type === 'web_search')?.web_search?.enable,
      ).toBe(true);
    });

    it('should use default search_mode performance_first', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'Baichuan3-Turbo',
        enabledSearch: true,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      const webSearchTool = calledPayload.tools?.find((tool: any) => tool.type === 'web_search');
      expect(webSearchTool?.web_search?.search_mode).toBe('performance_first');
    });

    it('should normalize temperature - 0 stays 0', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'Baichuan3-Turbo',
        temperature: 0,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.temperature).toBe(0);
    });

    it('should normalize temperature by halving it', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'Baichuan3-Turbo',
        temperature: 0.5,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.temperature).toBe(0.25);
    });

    it('should merge tools with web_search when enabledSearch is true', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'Baichuan3-Turbo',
        enabledSearch: true,
        tools: [{ type: 'function', function: { name: 'existing_tool' } }],
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.tools).toHaveLength(2);
      expect(calledPayload.tools?.some((tool: any) => tool.type === 'function')).toBe(true);
      expect(calledPayload.tools?.some((tool: any) => tool.type === 'web_search')).toBe(true);
    });
  });
});
