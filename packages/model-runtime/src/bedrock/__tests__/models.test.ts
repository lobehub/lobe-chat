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
      { id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'us.anthropic.claude-3-haiku-20240307-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-70b-instruct-v1:0', enabled: true },
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
      { id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'us.anthropic.claude-3-haiku-20240307-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-70b-instruct-v1:0', enabled: true },
    ]);
  });

  it('should handle "all" with exclusions', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'all,-us.anthropic.claude-3-haiku-20240307-v1:0',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-70b-instruct-v1:0', enabled: true },
    ]);
  });

  it('should handle explicit inclusions with + prefix', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST:
        '+us.anthropic.claude-3-sonnet-20240229-v1:0,+us.meta.llama3-1-70b-instruct-v1:0',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-70b-instruct-v1:0', enabled: true },
    ]);
  });

  it('should handle mixed inclusions and exclusions', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST:
        'us.anthropic.claude-3-sonnet-20240229-v1:0,us.anthropic.claude-3-haiku-20240307-v1:0,-us.anthropic.claude-3-haiku-20240307-v1:0',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true }]);
  });

  it('should handle empty model list', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: '',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'us.anthropic.claude-3-haiku-20240307-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-70b-instruct-v1:0', enabled: true },
    ]);
  });

  it('should handle whitespace and empty entries', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST:
        ' us.anthropic.claude-3-sonnet-20240229-v1:0 , , +us.meta.llama3-1-70b-instruct-v1:0 , ',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([
      { id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true },
      { id: 'us.meta.llama3-1-70b-instruct-v1:0', enabled: true },
    ]);
  });

  it('should handle non-existent model names gracefully', async () => {
    const { getLLMConfig } = await import('@/config/llm');
    vi.mocked(getLLMConfig).mockReturnValue({
      AWS_BEDROCK_MODEL_LIST: 'us.anthropic.claude-3-sonnet-20240229-v1:0,non-existent-model',
    } as any);

    const models = await bedrock.models();
    expect(models).toEqual([{ id: 'us.anthropic.claude-3-sonnet-20240229-v1:0', enabled: true }]);
  });
});
