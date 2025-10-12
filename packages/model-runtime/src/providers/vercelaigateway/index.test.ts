// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeVercelAIGatewayAI } from './index';

testProvider({
  Runtime: LobeVercelAIGatewayAI,
  provider: ModelProvider.VercelAIGateway,
  defaultBaseURL: 'https://ai-gateway.vercel.sh/v1',
  chatDebugEnv: 'DEBUG_VERCELAIGATEWAY_CHAT_COMPLETION',
  chatModel: 'gpt-4o',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});

describe('LobeVercelAIGatewayAI - custom features', () => {
  let instance: InstanceType<typeof LobeVercelAIGatewayAI>;

  beforeEach(() => {
    instance = new LobeVercelAIGatewayAI({ apiKey: 'test_api_key' });
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  describe('handlePayload', () => {
    it('should add reasoning_effort to providerOptions.openai', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'o1-preview',
        reasoning_effort: 'high',
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.providerOptions?.openai?.reasoningEffort).toBe('high');
      expect(calledPayload.providerOptions?.openai?.reasoningSummary).toBe('auto');
    });

    it('should handle both reasoning_effort and verbosity', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'o1-preview',
        reasoning_effort: 'medium',
        verbosity: 'low',
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.providerOptions?.openai?.reasoningEffort).toBe('medium');
      expect(calledPayload.providerOptions?.openai?.textVerbosity).toBe('low');
    });
  });
});
