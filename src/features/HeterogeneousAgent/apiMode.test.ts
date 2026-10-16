import { isHeterogeneousProviderBindingSupported } from '@lobechat/heterogeneous-agents';
import { describe, expect, it } from 'vitest';

import { supportsHeterogeneousApiMode } from './apiMode';

describe('supportsHeterogeneousApiMode', () => {
  it('offers server-default-only agents without enabling user-provider credentials', () => {
    expect(isHeterogeneousProviderBindingSupported('opencode')).toBe(false);
    expect(supportsHeterogeneousApiMode('opencode')).toBe(true);
  });

  it('retains existing bindings and excludes agents with no API transport', () => {
    expect(supportsHeterogeneousApiMode('claude-code')).toBe(true);
    expect(supportsHeterogeneousApiMode('amp')).toBe(false);
  });
});
