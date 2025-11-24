// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeVolcengineAI } from './index';

testProvider({
  Runtime: LobeVolcengineAI,
  provider: ModelProvider.Volcengine,
  defaultBaseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  chatDebugEnv: 'DEBUG_VOLCENGINE_CHAT_COMPLETION',
  chatModel: 'doubao-pro-32k',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});

describe('LobeVolcengineAI - custom features', () => {
  let instance: InstanceType<typeof LobeVolcengineAI>;

  beforeEach(() => {
    instance = new LobeVolcengineAI({ apiKey: 'test_api_key' });
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  describe('handlePayload', () => {
    it('should add thinking for thinking-vision-pro model', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'thinking-vision-pro',
        thinking: {
          type: 'enabled',
          budget_tokens: 1000,
        },
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.thinking).toEqual({ type: 'enabled' });
    });

    it('should add thinking for deepseek-v3-1 model', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'deepseek-v3-1',
        thinking: {
          type: 'enabled',
          budget_tokens: 2000,
        },
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.thinking).toEqual({ type: 'enabled' });
    });

    it('should not add thinking for non-thinking models', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'doubao-pro-32k',
        thinking: {
          type: 'enabled',
          budget_tokens: 1000,
        },
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.thinking).toBeUndefined();
    });
  });
});
