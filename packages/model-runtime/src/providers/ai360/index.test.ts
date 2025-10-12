// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeAi360AI } from './index';

testProvider({
  Runtime: LobeAi360AI,
  provider: ModelProvider.Ai360,
  defaultBaseURL: 'https://api.360.cn/v1',
  chatDebugEnv: 'DEBUG_AI360_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});

describe('LobeAi360AI - custom features', () => {
  let instance: InstanceType<typeof LobeAi360AI>;

  beforeEach(() => {
    instance = new LobeAi360AI({ apiKey: 'test_api_key' });
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  describe('handlePayload', () => {
    it('should add web_search tool when enabledSearch is true', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: '360gpt-pro',
        enabledSearch: true,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.tools).toBeDefined();
      expect(calledPayload.tools?.some((tool: any) => tool.type === 'web_search')).toBe(true);
    });

    it('should disable stream when tools are present', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: '360gpt-pro',
        tools: [{ type: 'function', function: { name: 'test' } }],
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.stream).toBe(false);
    });

    it('should enable stream when no tools', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: '360gpt-pro',
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.stream).not.toBe(false);
    });

    it('should merge tools with web_search when enabledSearch is true', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: '360gpt-pro',
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
