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
      { id: 'claude-3-sonnet', enabled: true },
      { id: 'claude-3-haiku', enabled: true },
      { id: 'llama-2-70b', enabled: true },
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
      { id: 'claude-3-sonnet' },
      { id: 'claude-3-haiku' },
      { id: 'llama-2-70b' },
    ]);
  });

  it('should handle "all" with exclusions', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'all,-claude-3-haiku',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'claude-3-sonnet' }, { id: 'llama-2-70b' }]);
  });

  it('should handle explicit inclusions with + prefix', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: '+claude-3-sonnet,+llama-2-70b',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'claude-3-sonnet' }, { id: 'llama-2-70b' }]);
  });

  it('should handle mixed inclusions and exclusions', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'claude-3-sonnet,claude-3-haiku,-claude-3-haiku',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'claude-3-sonnet' }]);
  });

  it('should handle empty model list', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: '',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'claude-3-sonnet' },
      { id: 'claude-3-haiku' },
      { id: 'llama-2-70b' },
    ]);
  });

  it('should handle whitespace and empty entries', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: ' claude-3-sonnet , , +llama-2-70b , ',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'claude-3-sonnet' }, { id: 'llama-2-70b' }]);
  });

  it('should handle non-existent model names gracefully', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'claude-3-sonnet,non-existent-model',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'claude-3-sonnet' }]);
  });
});
