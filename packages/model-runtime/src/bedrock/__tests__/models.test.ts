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
      { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0', enabled: true },
      { id: 'us.deepseek.r1-v1:0', enabled: true },
      { id: 'us.amazon.nova-premier-v1:0', enabled: true },
      { id: 'us.amazon.nova-lite-v1:0', enabled: true },
      { id: 'disabled-model', enabled: false },
    ],
  },
}));

describe('LobeBedrockAI models() method', () => {
  const bedrock = new LobeBedrockAI({ token: 'test-token' });

  it('should handle "all" keyword correctly', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'all',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0' },
      { id: 'us.deepseek.r1-v1:0' },
      { id: 'us.amazon.nova-premier-v1:0' },
      { id: 'us.amazon.nova-lite-v1:0' },
    ]);
  });

  it('should handle "all" with exclusions', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'all,-us.deepseek.r1-v1:0',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0' },
      { id: 'us.amazon.nova-premier-v1:0' },
      { id: 'us.amazon.nova-lite-v1:0' },
    ]);
  });

  it('should handle explicit inclusions with + prefix', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST:
        '+us.anthropic.claude-opus-4-1-20250805-v1:0,+us.amazon.nova-premier-v1:0',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0' },
      { id: 'us.amazon.nova-premier-v1:0' },
    ]);
  });

  it('should handle mixed inclusions and exclusions', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST:
        'us.anthropic.claude-opus-4-1-20250805-v1:0,us.deepseek.r1-v1:0,-us.deepseek.r1-v1:0',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'us.anthropic.claude-opus-4-1-20250805-v1:0' }]);
  });

  it('should handle empty model list', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: '',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0', enabled: true },
      { id: 'us.deepseek.r1-v1:0', enabled: true },
      { id: 'us.amazon.nova-premier-v1:0', enabled: true },
      { id: 'us.amazon.nova-lite-v1:0', enabled: true },
    ]);
  });

  it('should handle whitespace and empty entries', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST:
        ' us.anthropic.claude-opus-4-1-20250805-v1:0 , , +us.amazon.nova-premier-v1:0 , ',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-opus-4-1-20250805-v1:0' },
      { id: 'us.amazon.nova-premier-v1:0' },
    ]);
  });

  it('should handle non-existent model names gracefully', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'us.anthropic.claude-opus-4-1-20250805-v1:0,non-existent-model',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'us.anthropic.claude-opus-4-1-20250805-v1:0' }]);
  });
});
