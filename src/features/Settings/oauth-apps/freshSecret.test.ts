import { describe, expect, it } from 'vitest';

import { clearFreshSecret, peekFreshSecret, stashFreshSecret } from './freshSecret';

describe('freshSecret handoff', () => {
  it('hands the stashed secret to the matching app only until cleared', () => {
    stashFreshSecret('app-1', 'secret-1');

    expect(peekFreshSecret('app-2')).toBeUndefined();
    expect(peekFreshSecret('app-1')).toBe('secret-1');
    // Peeking is idempotent so StrictMode's double render sees the same value.
    expect(peekFreshSecret('app-1')).toBe('secret-1');

    clearFreshSecret('app-1');

    expect(peekFreshSecret('app-1')).toBeUndefined();
  });
});
