import { describe, expect, it, vi } from 'vitest';

import { readAuthResources } from './authResources';

vi.mock('@/business/client/authErrorResourceOverrides', () => ({
  getAuthErrorResourceOverrides: (locale: string) => ({
    'codes.BUSINESS_ERROR': `Business error: ${locale}`,
  }),
}));

describe('readAuthResources', () => {
  it.each(['en-US', 'zh-CN'])('merges auth error resource overrides for %s', (locale) => {
    expect(readAuthResources(locale).authError['codes.BUSINESS_ERROR']).toBe(
      `Business error: ${locale}`,
    );
  });
});
