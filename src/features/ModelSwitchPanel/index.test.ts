import { describe, expect, it } from 'vitest';

const menuKey = (provider: string, model: string) => `${provider}-${model}`;

describe('menuKey', () => {
  it('should generate correct key for provider and model combination', () => {
    expect(menuKey('openai', 'gpt-4')).toBe('openai-gpt-4');
    expect(menuKey('anthropic', 'claude-2')).toBe('anthropic-claude-2');
    expect(menuKey('', '')).toBe('-');
  });

  it('should handle special characters in provider and model names', () => {
    expect(menuKey('provider.test', 'model-123')).toBe('provider.test-model-123');
    expect(menuKey('provider/test', 'model/123')).toBe('provider/test-model/123');
    expect(menuKey('provider_test', 'model_123')).toBe('provider_test-model_123');
  });

  it('should handle unicode characters', () => {
    expect(menuKey('提供商', '模型')).toBe('提供商-模型');
    expect(menuKey('プロバイダー', 'モデル')).toBe('プロバイダー-モデル');
  });
});
