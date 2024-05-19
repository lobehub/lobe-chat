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
      '[Server Config] you are importing a server-only module outside of server',
    );

    global.process = originalProcess; // Restore the original process object
  });

  it('correctly handles values for OPENAI_FUNCTION_REGIONS', () => {
    process.env.OPENAI_FUNCTION_REGIONS = 'iad1,sfo1';
    const config = getServerConfig();
    expect(config.OPENAI_FUNCTION_REGIONS).toStrictEqual(['iad1', 'sfo1']);
  });

  describe('index url', () => {
    it('should return default URLs when no environment variables are set', () => {
      const config = getServerConfig();
      expect(config.AGENTS_INDEX_URL).toBe('https://chat-agents.lobehub.com');
      expect(config.PLUGINS_INDEX_URL).toBe('https://chat-plugins.lobehub.com');
    });

    it('should return custom URLs when environment variables are set', () => {
      process.env.AGENTS_INDEX_URL = 'https://custom-agents-url.com';
      process.env.PLUGINS_INDEX_URL = 'https://custom-plugins-url.com';
      const config = getServerConfig();
      expect(config.AGENTS_INDEX_URL).toBe('https://custom-agents-url.com');
      expect(config.PLUGINS_INDEX_URL).toBe('https://custom-plugins-url.com');
    });

    it('should return default URLs when environment variables are empty string', () => {
      process.env.AGENTS_INDEX_URL = '';
      process.env.PLUGINS_INDEX_URL = '';

      const config = getServerConfig();
      expect(config.AGENTS_INDEX_URL).toBe('https://chat-agents.lobehub.com');
      expect(config.PLUGINS_INDEX_URL).toBe('https://chat-plugins.lobehub.com');
    });
  });
});
