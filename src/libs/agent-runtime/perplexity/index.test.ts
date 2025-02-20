// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime, ModelProvider } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobePerplexityAI } from './index';

testProvider({
  Runtime: LobePerplexityAI,
  provider: ModelProvider.Perplexity,
  defaultBaseURL: 'https://api.perplexity.ai',
  chatDebugEnv: 'DEBUG_PERPLEXITY_CHAT_COMPLETION',
  chatModel: 'sonar',
});

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobePerplexityAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobePerplexityAI', () => {
  describe('chat', () => {
    it('should call chat method with temperature', async () => {
      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
        new ReadableStream() as any,
      );

      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 1.5,
      });

      expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array),
          model: 'text-davinci-003',
          temperature: 1.5,
        }),
        expect.any(Object),
      );
    });

    it('should be undefined when temperature >= 2', async () => {
      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
        new ReadableStream() as any,
      );

      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 2,
      });

      expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array),
          model: 'text-davinci-003',
          temperature: undefined,
        }),
        expect.any(Object),
      );
    });
  });
});
