import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getServerConfig } from '../server';

// Stub the global process object to safely mock environment variables
vi.stubGlobal('process', {
  ...process, // Preserve the original process object
  env: { ...process.env }, // Clone the environment variables object for modification
});

describe('getServerConfig', () => {
  beforeEach(() => {
    // Reset environment variables before each test case
    vi.restoreAllMocks();
  });

  it('throws an error if process is undefined', () => {
    const originalProcess = global.process;
    // To simulate the error condition, temporarily set the global process to `undefined`,
    // @ts-ignore
    global.process = undefined;

    expect(() => getServerConfig()).toThrow(
      '[Server Config] you are importing a nodejs-only module outside of nodejs',
    );

    global.process = originalProcess; // Restore the original process object
  });

  it('correctly reflects boolean value for USE_AZURE_OPENAI', () => {
    process.env.USE_AZURE_OPENAI = '1';
    const config = getServerConfig();
    expect(config.USE_AZURE_OPENAI).toBe(true);
  });

  it('correctly handles falsy values for USE_AZURE_OPENAI', () => {
    process.env.USE_AZURE_OPENAI = '0';
    const config = getServerConfig();
    expect(config.USE_AZURE_OPENAI).toBe(false);
  });
});
