import { ModelProvider } from '@lobechat/model-runtime';
import { describe, expect, it } from 'vitest';

describe('ModelProvider', () => {
  it('should be a valid enum object', () => {
    expect(typeof ModelProvider).toBe('object');
    expect(ModelProvider).not.toBeNull();
  });
});
