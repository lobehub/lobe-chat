// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuthConfig } from '../auth';

// Stub the global process object to safely mock environment variables
vi.stubGlobal('process', {
  ...process, // Preserve the original process object
  env: { ...process.env }, // Clone the environment variables object for modification
});

const spyConsoleWarn = vi.spyOn(console, 'warn');

describe('getAuthConfig', () => {
  beforeEach(() => {
    // Clear all environment variables before each test
    // @ts-expect-error
    process.env = {};
  });
});
