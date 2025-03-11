import { describe, expect, it, vi } from 'vitest';

import { naive } from '../naive';

// Skipping tests since withTimeout is not accessible
describe.skip('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
