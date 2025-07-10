// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeGroq } from './index';

testProvider({
  provider: 'groq',
  defaultBaseURL: 'https://api.groq.com/openai/v1',
  chatModel: 'mistralai/mistral-7b-instruct:free',
  Runtime: LobeGroq,
  chatDebugEnv: 'DEBUG_GROQ_CHAT_COMPLETION',
});

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeGroq({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeGroqAI Temperature Tests', () => {
  describe('handlePayload option', () => {
    it('should set stream to false when payload contains tools', async () => {
      const mockCreateMethod = vi
        .spyOn(instance['client'].chat.completions, 'create')
        .mockResolvedValue({
          id: 'chatcmpl-8xDx5AETP8mESQN7UB30GxTN2H1SO',
          object: 'chat.completion',
          created: 1709125675,
          model: 'mistralai/mistral-7b-instruct:free',
          system_fingerprint: 'fp_86156a94a0',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'hello', refusal: null },
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
        });

      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'mistralai/mistral-7b-instruct:free',
        temperature: 0,
        tools: [
          {
            type: 'function',
            function: { name: 'tool1', description: '', parameters: {} },
          },
        ],
      });

      expect(mockCreateMethod).toHaveBeenCalledWith(
        expect.objectContaining({ stream: false }),
        expect.anything(),
      );
    });
  });

  it('should set temperature to 0.7', async () => {
    await instance.chat({
      messages: [{ content: 'Hello', role: 'user' }],
      model: 'mistralai/mistral-7b-instruct:free',
      temperature: 0.7,
    });

    expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.7 }),
      expect.anything(),
    );
  });

  it('should set temperature to 0', async () => {
    await instance.chat({
      messages: [{ content: 'Hello', role: 'user' }],
      model: 'mistralai/mistral-7b-instruct:free',
      temperature: 0,
    });

    expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: undefined }),
      expect.anything(),
    );
  });

  it('should set temperature to negative', async () => {
    await instance.chat({
      messages: [{ content: 'Hello', role: 'user' }],
      model: 'mistralai/mistral-7b-instruct:free',
      temperature: -1.0,
    });

    expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: undefined }),
      expect.anything(),
    );
  });
});
