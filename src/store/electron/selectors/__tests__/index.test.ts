import { describe, expect, it } from 'vitest';

// Note: Since the source file only exports from other files and doesn't contain any direct code,
// we only need minimal tests to verify the exports are working

describe('electron store selectors', () => {
  it('should export modules correctly', async () => {
    const exports = await import('../index');
    expect(exports).toBeDefined();
    expect(Object.keys(exports).length).toBeGreaterThan(0);
  });
});
