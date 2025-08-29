import { existsSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('Desktop TRPC Route', () => {
  it('should have desktop directory', () => {
    const desktopPath = join(__dirname, 'desktop');
    expect(existsSync(desktopPath)).toBe(true);
  });
});
