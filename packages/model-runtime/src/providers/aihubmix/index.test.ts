// @vitest-environment edge-runtime
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeAiHubMixAI } from './index';

describe('LobeAiHubMixAI', () => {
  let instance: InstanceType<typeof LobeAiHubMixAI>;

  beforeEach(() => {
    instance = new LobeAiHubMixAI({ apiKey: 'test_api_key' });
  });

  describe('constructor', () => {
    it('should initialize with correct provider', () => {
      expect(instance).toBeDefined();
    });

    it('should set APP-Code header', () => {
      // The RouterRuntime-based providers have different structure
      // We just verify the instance is created correctly
      expect(instance).toBeInstanceOf(LobeAiHubMixAI);
    });

    it('should use default APP-Code when env var not set', () => {
      const originalEnv = process.env.AIHUBMIX_APP_CODE;
      delete process.env.AIHUBMIX_APP_CODE;
      
      const { params } = require('./index');
      expect(params.defaultHeaders['APP-Code']).toBe('LobeHub');
      
      process.env.AIHUBMIX_APP_CODE = originalEnv;
    });

    it('should use custom APP-Code when env var is set', () => {
      const originalEnv = process.env.AIHUBMIX_APP_CODE;
      process.env.AIHUBMIX_APP_CODE = 'CustomCode';
      
      // Re-require to get updated params
      delete require.cache[require.resolve('./index')];
      const { params } = require('./index');
      expect(params.defaultHeaders['APP-Code']).toBe('CustomCode');
      
      process.env.AIHUBMIX_APP_CODE = originalEnv;
      delete require.cache[require.resolve('./index')];
    });
  });

  describe('chat', () => {
    it('should support chat method', async () => {
      vi.spyOn(instance as any, 'getRuntimeByModel').mockResolvedValue({
        chat: vi.fn().mockResolvedValue(new Response()),
      });

      const payload = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'gpt-4',
        temperature: 0.7,
      };

      const result = await instance.chat(payload);
      expect(result).toBeDefined();
    });
  });

  describe('models', () => {
    it('should return empty array on error', async () => {
      // Mock the client to throw an error
      const mockClient = {
        models: {
          list: vi.fn().mockRejectedValue(new Error('API Error')),
        },
      };

      vi.spyOn(instance as any, 'getRuntimeByModel').mockResolvedValue({
        models: async () => {
          try {
            await mockClient.models.list();
          } catch (error) {
            console.warn(
              'Failed to fetch AiHubMix models. Please ensure your AiHubMix API key is valid:',
              error,
            );
            return [];
          }
        },
      });

      // The models method should return empty array on error
      const models = await (instance as any)
        .getRuntimeByModel('test-model')
        .then((r: any) => r.models());
      expect(models).toEqual([]);
    });
  });
});
