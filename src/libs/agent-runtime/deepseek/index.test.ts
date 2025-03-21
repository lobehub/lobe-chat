// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ChatStreamPayload,
  LLMRoleType,
  LobeOpenAICompatibleRuntime,
  ModelProvider,
} from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeDeepSeekAI } from './index';

const provider = ModelProvider.DeepSeek;
const defaultBaseURL = 'https://api.deepseek.com/v1';

testProvider({
  Runtime: LobeDeepSeekAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_DEEPSEEK_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
  test: {
    skipAPICall: true,
  },
});

let instance: LobeOpenAICompatibleRuntime;

const createDeepSeekAIInstance = () => new LobeDeepSeekAI({ apiKey: 'test' });

const mockSuccessfulChatCompletion = () => {
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue({
    id: 'cmpl-mock',
    object: 'chat.completion',
    created: Date.now(),
    choices: [
      { index: 0, message: { role: 'assistant', content: 'Mock response' }, finish_reason: 'stop' },
    ],
  } as any);
};

beforeEach(() => {
  instance = new LobeDeepSeekAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeDeepSeekAI', () => {
  describe('deepseek-reasoner', () => {
    beforeEach(() => {
      instance = createDeepSeekAIInstance();
      mockSuccessfulChatCompletion();
    });

    it('should insert a user message if the first message is from assistant', async () => {
      const payloadMessages = [{ content: 'Hello', role: 'assistant' as LLMRoleType }];
      const expectedMessages = [{ content: '', role: 'user' }, ...payloadMessages];

      const payload: ChatStreamPayload = {
        messages: payloadMessages,
        model: 'deepseek-reasoner',
        temperature: 0,
      };

      await instance.chat(payload);

      expect(instance['client'].chat.completions.create).toHaveBeenCalled();
      const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
      const actualMessages = actualArgs[0].messages;
      expect(actualMessages).toEqual(expectedMessages);
    });

    it('should insert a user message if the first message is from assistant (with system summary)', async () => {
      const payloadMessages = [
        { content: 'System summary', role: 'system' as LLMRoleType },
        { content: 'Hello', role: 'assistant' as LLMRoleType },
      ];
      const expectedMessages = [
        { content: 'System summary', role: 'system' },
        { content: '', role: 'user' },
        { content: 'Hello', role: 'assistant' },
      ];

      const payload: ChatStreamPayload = {
        messages: payloadMessages,
        model: 'deepseek-reasoner',
        temperature: 0,
      };

      await instance.chat(payload);

      expect(instance['client'].chat.completions.create).toHaveBeenCalled();
      const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
      const actualMessages = actualArgs[0].messages;
      expect(actualMessages).toEqual(expectedMessages);
    });

    it('should insert alternating roles if messages do not alternate', async () => {
      const payloadMessages = [
        { content: 'user1', role: 'user' as LLMRoleType },
        { content: 'user2', role: 'user' as LLMRoleType },
        { content: 'assistant1', role: 'assistant' as LLMRoleType },
        { content: 'assistant2', role: 'assistant' as LLMRoleType },
      ];
      const expectedMessages = [
        { content: 'user1', role: 'user' },
        { content: '', role: 'assistant' },
        { content: 'user2', role: 'user' },
        { content: 'assistant1', role: 'assistant' },
        { content: '', role: 'user' },
        { content: 'assistant2', role: 'assistant' },
      ];

      const payload: ChatStreamPayload = {
        messages: payloadMessages,
        model: 'deepseek-reasoner',
        temperature: 0,
      };

      await instance.chat(payload);

      expect(instance['client'].chat.completions.create).toHaveBeenCalled();
      const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
      const actualMessages = actualArgs[0].messages;
      expect(actualMessages).toEqual(expectedMessages);
    });

    it('complex condition', async () => {
      const payloadMessages = [
        { content: 'system', role: 'system' as LLMRoleType },
        { content: 'assistant', role: 'assistant' as LLMRoleType },
        { content: 'user1', role: 'user' as LLMRoleType },
        { content: 'user2', role: 'user' as LLMRoleType },
        { content: 'user3', role: 'user' as LLMRoleType },
        { content: 'assistant1', role: 'assistant' as LLMRoleType },
        { content: 'assistant2', role: 'assistant' as LLMRoleType },
      ];
      const expectedMessages = [
        { content: 'system', role: 'system' },
        { content: '', role: 'user' },
        { content: 'assistant', role: 'assistant' },
        { content: 'user1', role: 'user' },
        { content: '', role: 'assistant' },
        { content: 'user2', role: 'user' },
        { content: '', role: 'assistant' },
        { content: 'user3', role: 'user' },
        { content: 'assistant1', role: 'assistant' },
        { content: '', role: 'user' },
        { content: 'assistant2', role: 'assistant' },
      ];

      const payload: ChatStreamPayload = {
        messages: payloadMessages,
        model: 'deepseek-reasoner',
        temperature: 0,
      };

      await instance.chat(payload);

      expect(instance['client'].chat.completions.create).toHaveBeenCalled();
      const actualArgs = (instance['client'].chat.completions.create as Mock).mock.calls[0];
      const actualMessages = actualArgs[0].messages;
      expect(actualMessages).toEqual(expectedMessages);
    });
  });
});
