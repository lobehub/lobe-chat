import { describe, expect, it, vi } from 'vitest';

import { LobeBedrockAI } from '../index';

// Mock the config imports
vi.mock('@/config/llm', () => ({
  getLLMConfig: vi.fn(() => ({
    AWS_BEDROCK_MODEL_LIST: undefined,
  })),
}));

vi.mock('@/config/modelProviders/bedrock', () => ({
  default: {
    chatModels: [
      // Amazon Nova Models (Cross-Region)
      { id: 'us.amazon.nova-premier-v1:0', enabled: true },
      { id: 'us.amazon.nova-pro-v1:0', enabled: true },
      { id: 'us.amazon.nova-lite-v1:0', enabled: true },
      { id: 'us.amazon.nova-micro-v1:0', enabled: true },
      { id: 'eu.amazon.nova-pro-v1:0', enabled: true },
      { id: 'eu.amazon.nova-lite-v1:0', enabled: true },
      { id: 'eu.amazon.nova-micro-v1:0', enabled: true },
      { id: 'apac.amazon.nova-pro-v1:0', enabled: true },
      { id: 'apac.amazon.nova-lite-v1:0', enabled: true },
      { id: 'apac.amazon.nova-micro-v1:0', enabled: true },

      // Claude Models (Cross-Region)
      { id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0', enabled: true },
      { id: 'eu.anthropic.claude-3-7-sonnet-20250219-v1:0', enabled: true },
      { id: 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0', enabled: true },
      { id: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0', enabled: true },
      { id: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0', enabled: true },
      { id: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0', enabled: true },
      { id: 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0', enabled: true },
      { id: 'us.anthropic.claude-3-haiku-20240307-v1:0', enabled: true },
      { id: 'eu.anthropic.claude-3-haiku-20240307-v1:0', enabled: true },
      { id: 'apac.anthropic.claude-3-haiku-20240307-v1:0', enabled: true },
      { id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'eu.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'apac.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'us.anthropic.claude-3-opus-20240229-v1:0', enabled: true },
      { id: 'us.anthropic.claude-opus-4-20250514-v1:0', enabled: true },
      { id: 'us.anthropic.claude-sonnet-4-20250514-v1:0', enabled: true },
      { id: 'eu.anthropic.claude-sonnet-4-20250514-v1:0', enabled: true },
      { id: 'apac.anthropic.claude-sonnet-4-20250514-v1:0', enabled: true },

      // US GovCloud Models
      { id: 'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0', enabled: true },
      { id: 'us-gov.anthropic.claude-3-haiku-20240307-v1:0', enabled: true },

      // Meta Llama Models (Cross-Region)
      { id: 'us.meta.llama3-1-405b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-70b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-8b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama3-2-11b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama3-2-1b-instruct-v1:0', enabled: true },
      { id: 'eu.meta.llama3-2-1b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama3-2-3b-instruct-v1:0', enabled: true },
      { id: 'eu.meta.llama3-2-3b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama3-2-90b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama3-3-70b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama4-maverick-17b-instruct-v1:0', enabled: true },
      { id: 'us.meta.llama4-scout-17b-instruct-v1:0', enabled: true },

      // DeepSeek Models (Cross-Region)
      { id: 'us.deepseek.r1-v1:0', enabled: true },

      // Mistral Models (Cross-Region)
      { id: 'us.mistral.pixtral-large-2502-v1:0', enabled: true },
      { id: 'eu.mistral.pixtral-large-2502-v1:0', enabled: true },

      { id: 'disabled-model', enabled: false },
    ],
  },
}));

describe('LobeBedrockAI Cross-Region Inference Profiles', () => {
  const bedrock = new LobeBedrockAI({ token: 'test-token' });

  describe('Amazon Nova Models', () => {
    it('should include US region Nova models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'us.amazon.nova-premier-v1:0,us.amazon.nova-pro-v1:0,us.amazon.nova-lite-v1:0,us.amazon.nova-micro-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us.amazon.nova-premier-v1:0' },
        { id: 'us.amazon.nova-pro-v1:0' },
        { id: 'us.amazon.nova-lite-v1:0' },
        { id: 'us.amazon.nova-micro-v1:0' },
      ]);
    });

    it('should include EU region Nova models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'eu.amazon.nova-pro-v1:0,eu.amazon.nova-lite-v1:0,eu.amazon.nova-micro-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'eu.amazon.nova-pro-v1:0' },
        { id: 'eu.amazon.nova-lite-v1:0' },
        { id: 'eu.amazon.nova-micro-v1:0' },
      ]);
    });

    it('should include APAC region Nova models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'apac.amazon.nova-pro-v1:0,apac.amazon.nova-lite-v1:0,apac.amazon.nova-micro-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'apac.amazon.nova-pro-v1:0' },
        { id: 'apac.amazon.nova-lite-v1:0' },
        { id: 'apac.amazon.nova-micro-v1:0' },
      ]);
    });
  });

  describe('Claude Models Cross-Region', () => {
    it('should include US region Claude models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'us.anthropic.claude-3-7-sonnet-20250219-v1:0,us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0' },
        { id: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0' },
      ]);
    });

    it('should include EU region Claude models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'eu.anthropic.claude-3-7-sonnet-20250219-v1:0,eu.anthropic.claude-3-haiku-20240307-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'eu.anthropic.claude-3-7-sonnet-20250219-v1:0' },
        { id: 'eu.anthropic.claude-3-haiku-20240307-v1:0' },
      ]);
    });

    it('should include APAC region Claude models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'apac.anthropic.claude-3-7-sonnet-20250219-v1:0,apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0' },
        { id: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0' },
      ]);
    });

    it('should include US GovCloud Claude models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0,us-gov.anthropic.claude-3-haiku-20240307-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0' },
        { id: 'us-gov.anthropic.claude-3-haiku-20240307-v1:0' },
      ]);
    });
  });

  describe('Meta Llama Models Cross-Region', () => {
    it('should include US region Llama models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'us.meta.llama3-1-405b-instruct-v1:0,us.meta.llama3-1-70b-instruct-v1:0,us.meta.llama3-1-8b-instruct-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us.meta.llama3-1-405b-instruct-v1:0' },
        { id: 'us.meta.llama3-1-70b-instruct-v1:0' },
        { id: 'us.meta.llama3-1-8b-instruct-v1:0' },
      ]);
    });

    it('should include Llama 3.2 models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'us.meta.llama3-2-11b-instruct-v1:0,us.meta.llama3-2-1b-instruct-v1:0,us.meta.llama3-2-3b-instruct-v1:0,us.meta.llama3-2-90b-instruct-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us.meta.llama3-2-11b-instruct-v1:0' },
        { id: 'us.meta.llama3-2-1b-instruct-v1:0' },
        { id: 'us.meta.llama3-2-3b-instruct-v1:0' },
        { id: 'us.meta.llama3-2-90b-instruct-v1:0' },
      ]);
    });

    it('should include Llama 3.3 and 4.x models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'us.meta.llama3-3-70b-instruct-v1:0,us.meta.llama4-maverick-17b-instruct-v1:0,us.meta.llama4-scout-17b-instruct-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us.meta.llama3-3-70b-instruct-v1:0' },
        { id: 'us.meta.llama4-maverick-17b-instruct-v1:0' },
        { id: 'us.meta.llama4-scout-17b-instruct-v1:0' },
      ]);
    });

    it('should include EU region Llama models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'eu.meta.llama3-2-1b-instruct-v1:0,eu.meta.llama3-2-3b-instruct-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'eu.meta.llama3-2-1b-instruct-v1:0' },
        { id: 'eu.meta.llama3-2-3b-instruct-v1:0' },
      ]);
    });
  });

  describe('DeepSeek Models Cross-Region', () => {
    it('should include US region DeepSeek R1 model', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'us.deepseek.r1-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([{ id: 'us.deepseek.r1-v1:0' }]);
    });
  });

  describe('Mistral Models Cross-Region', () => {
    it('should include US region Mistral models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'us.mistral.pixtral-large-2502-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([{ id: 'us.mistral.pixtral-large-2502-v1:0' }]);
    });

    it('should include EU region Mistral models', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'eu.mistral.pixtral-large-2502-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([{ id: 'eu.mistral.pixtral-large-2502-v1:0' }]);
    });
  });

  describe('Mixed Cross-Region Model Selection', () => {
    it('should handle mixed regional models with exclusions', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'all,-us.amazon.nova-micro-v1:0',
      } as any);

      const models = await bedrock.models();

      // Should include cross-region models
      expect(models.map((m) => m.id)).toContain('us.amazon.nova-premier-v1:0');
      expect(models.map((m) => m.id)).toContain('us.anthropic.claude-3-7-sonnet-20250219-v1:0');
      expect(models.map((m) => m.id)).toContain('us.meta.llama3-1-405b-instruct-v1:0');
      expect(models.map((m) => m.id)).not.toContain('disabled-model');
    });

    it('should handle region-specific model selection', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          '+us.amazon.nova-premier-v1:0,+eu.anthropic.claude-3-7-sonnet-20250219-v1:0,+apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us.amazon.nova-premier-v1:0' },
        { id: 'eu.anthropic.claude-3-7-sonnet-20250219-v1:0' },
        { id: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0' },
      ]);
    });

    it('should handle GovCloud model selection', async () => {
      const { getLLMConfig } = await import('@/config/llm');
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST:
          'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0,us-gov.anthropic.claude-3-haiku-20240307-v1:0',
      } as any);

      const models = await bedrock.models();
      expect(models).toEqual([
        { id: 'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0' },
        { id: 'us-gov.anthropic.claude-3-haiku-20240307-v1:0' },
      ]);
    });
  });

  describe('Model ID Pattern Validation', () => {
    it('should validate cross-region inference profile ID patterns', async () => {
      const { getLLMConfig } = await import('@/config/llm');

      // Test US region pattern
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'us.amazon.nova-premier-v1:0',
      } as any);

      let models = await bedrock.models();
      expect(models[0].id).toMatch(/^us\./);

      // Test EU region pattern
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'eu.amazon.nova-pro-v1:0',
      } as any);

      models = await bedrock.models();
      expect(models[0].id).toMatch(/^eu\./);

      // Test APAC region pattern
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'apac.amazon.nova-lite-v1:0',
      } as any);

      models = await bedrock.models();
      expect(models[0].id).toMatch(/^apac\./);

      // Test US-Gov region pattern
      vi.mocked(getLLMConfig).mockReturnValue({
        AWS_BEDROCK_MODEL_LIST: 'us-gov.anthropic.claude-3-haiku-20240307-v1:0',
      } as any);

      models = await bedrock.models();
      expect(models[0].id).toMatch(/^us-gov\./);
    });
  });
});
