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

  it('correctly handles values for OPENAI_FUNCTION_REGIONS', () => {
    process.env.OPENAI_FUNCTION_REGIONS = 'iad1,sfo1';
    const config = getServerConfig();
    expect(config.OPENAI_FUNCTION_REGIONS).toStrictEqual(['iad1', 'sfo1']);
  });

  it('returns default IMGUR_CLIENT_ID when no environment variable is set', () => {
    const config = getServerConfig();
    expect(config.IMGUR_CLIENT_ID).toBe('e415f320d6e24f9');
  });

  it('returns custom IMGUR_CLIENT_ID when environment variable is set', () => {
    process.env.IMGUR_CLIENT_ID = 'custom-client-id';
    const config = getServerConfig();
    expect(config.IMGUR_CLIENT_ID).toBe('custom-client-id');
  });
});
