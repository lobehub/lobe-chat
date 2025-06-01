// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppConfig } from '../../envs/app';

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

  // it('correctly handles values for OPENAI_FUNCTION_REGIONS', () => {
  //   process.env.OPENAI_FUNCTION_REGIONS = 'iad1,sfo1';
  //   const config = getAppConfig();
  //   expect(config.OPENAI_FUNCTION_REGIONS).toStrictEqual(['iad1', 'sfo1']);
  // });

  describe('index url', () => {
    it('should return default URLs when no environment variables are set', () => {
      const config = getAppConfig();
      expect(config.AGENTS_INDEX_URL).toBe(
        'https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public',
      );
      expect(config.PLUGINS_INDEX_URL).toBe('https://chat-plugins.lobehub.com');
    });

    it('should return custom URLs when environment variables are set', () => {
      process.env.AGENTS_INDEX_URL = 'https://custom-agents-url.com';
      process.env.PLUGINS_INDEX_URL = 'https://custom-plugins-url.com';
      const config = getAppConfig();
      expect(config.AGENTS_INDEX_URL).toBe('https://custom-agents-url.com');
      expect(config.PLUGINS_INDEX_URL).toBe('https://custom-plugins-url.com');
    });

    it('should return default URLs when environment variables are empty string', () => {
      process.env.AGENTS_INDEX_URL = '';
      process.env.PLUGINS_INDEX_URL = '';

      const config = getAppConfig();
      expect(config.AGENTS_INDEX_URL).toBe(
        'https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public',
      );
      expect(config.PLUGINS_INDEX_URL).toBe('https://chat-plugins.lobehub.com');
    });
  });
});
