// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeCerebrasAI } from './index';

testProvider({
  Runtime: LobeCerebrasAI,
  provider: ModelProvider.Cerebras,
  defaultBaseURL: 'https://api.cerebras.ai/v1',
  chatDebugEnv: 'DEBUG_CEREBRAS_CHAT_COMPLETION',
  chatModel: 'llama3.1-8b',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});

describe('LobeCerebrasAI - custom features', () => {
  let instance: InstanceType<typeof LobeCerebrasAI>;

  beforeEach(() => {
    instance = new LobeCerebrasAI({ apiKey: 'test_api_key' });
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  describe('handlePayload', () => {
    it('should remove frequency_penalty and presence_penalty from payload', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'llama3.1-8b',
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.frequency_penalty).toBeUndefined();
      expect(calledPayload.presence_penalty).toBeUndefined();
      expect(calledPayload.model).toBe('llama3.1-8b');
    });
  });
});
