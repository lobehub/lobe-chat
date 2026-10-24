import { describe, expect, it } from 'vitest';

import { formatSuspensionRetryAt } from './SignInEmailStep';

describe('formatSuspensionRetryAt', () => {
  it('formats the retry time with the active page language instead of the fallback language', () => {
    const formatted = formatSuspensionRetryAt('2026-10-31T19:43:53.841Z', 'zh-CN');

    expect(formatted).toMatch(/[年月日]/);
    expect(formatted).not.toContain('Nov');
    expect(formatted).not.toContain('AM');
  });
});
