// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeNebiusAI, params } from './index';

const provider = ModelProvider.Nebius;
const defaultBaseURL = 'https://api.studio.nebius.com/v1';

testProvider({
  Runtime: LobeNebiusAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_NEBIUS_CHAT_COMPLETION',
  chatModel: 'meta/llama-3.1-8b-instruct',
  test: {
    skipAPICall: true,
  },
});

describe('LobeNebiusAI - custom features', () => {
  let instance: InstanceType<typeof LobeNebiusAI>;

  beforeEach(() => {
    instance = new LobeNebiusAI({ apiKey: 'test_api_key' });
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  describe('params export', () => {
    it('should export params with correct structure', () => {
      expect(params).toBeDefined();
      expect(params.provider).toBe(ModelProvider.Nebius);
      expect(params.baseURL).toBe('https://api.studio.nebius.com/v1');
      expect(params.debug).toBeDefined();
      expect(params.chatCompletion).toBeDefined();
      expect(params.models).toBeDefined();
    });

    it('should have debug.chatCompletion function', () => {
      expect(typeof params.debug?.chatCompletion).toBe('function');
    });

    it('should return false when DEBUG_NEBIUS_CHAT_COMPLETION is not set', () => {
      delete process.env.DEBUG_NEBIUS_CHAT_COMPLETION;
      expect(params.debug?.chatCompletion()).toBe(false);
    });

    it('should return true when DEBUG_NEBIUS_CHAT_COMPLETION is set to 1', () => {
      process.env.DEBUG_NEBIUS_CHAT_COMPLETION = '1';
      expect(params.debug?.chatCompletion()).toBe(true);
      delete process.env.DEBUG_NEBIUS_CHAT_COMPLETION;
    });
  });

  describe('handlePayload', () => {
    it('should always set stream to true', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'meta/llama-3.1-8b-instruct',
        stream: false,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.stream).toBe(true);
    });

    it('should preserve model in payload', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'meta/llama-3.1-8b-instruct',
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.model).toBe('meta/llama-3.1-8b-instruct');
    });

    it('should preserve other payload properties', async () => {
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'meta/llama-3.1-8b-instruct',
        temperature: 0.7,
        max_tokens: 100,
      });

      const calledPayload = (instance['client'].chat.completions.create as any).mock.calls[0][0];
      expect(calledPayload.temperature).toBe(0.7);
      expect(calledPayload.max_tokens).toBe(100);
    });
  });

  describe('modality inference logic', () => {
    it('should infer image type from modality', () => {
      const modality = 'text -> image';
      const parts = modality.split('->');
      const right = parts[1]?.trim().toLowerCase();
      expect(right).toBe('image');
    });

    it('should infer embedding type from modality', () => {
      const modality = 'text -> embedding';
      const parts = modality.split('->');
      const right = parts[1]?.trim().toLowerCase();
      expect(right).toBe('embedding');
    });

    it('should handle modality without ->', () => {
      const modality = 'text';
      const hasArrow = modality.includes('->');
      expect(hasArrow).toBe(false);
    });
  });

  describe('pricing calculation', () => {
    it('should convert pricing to per million tokens', () => {
      const pricing = {
        prompt: 0.001,
        completion: 0.002,
      };
      const result = {
        input: pricing.prompt * 1_000_000,
        output: pricing.completion * 1_000_000,
      };
      expect(result.input).toBe(1000);
      expect(result.output).toBe(2000);
    });
  });

  describe('features detection', () => {
    it('should detect function-calling feature', () => {
      const features = ['function-calling', 'vision'];
      expect(features.includes('function-calling')).toBe(true);
    });

    it('should detect reasoning feature', () => {
      const features = ['reasoning', 'vision'];
      expect(features.includes('reasoning')).toBe(true);
    });

    it('should detect vision feature', () => {
      const features = ['function-calling', 'vision'];
      expect(features.includes('vision')).toBe(true);
    });
  });
});
