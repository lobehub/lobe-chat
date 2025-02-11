import { describe, expect, it, vi } from 'vitest';

import { testProvider } from './providerTestUtils';

describe('testProvider', () => {
  it('should create test suite for provider runtime', () => {
    class MockRuntime {
      baseURL: string;
      client: any;

      constructor({ apiKey }: { apiKey?: string }) {
        if (!apiKey) throw { errorType: 'InvalidProviderAPIKey' };
        this.baseURL = 'https://api.test.com';
        this.client = {
          chat: {
            completions: {
              create: vi.fn(),
            },
          },
        };
      }
    }

    const mockParams = {
      Runtime: MockRuntime,
      chatDebugEnv: 'DEBUG_CHAT',
      chatModel: 'test-model',
      defaultBaseURL: 'https://api.test.com',
      provider: 'test-provider',
    };

    // This shouldn't throw
    expect(() => testProvider(mockParams)).not.toThrow();
  });

  it('should handle custom error types', () => {
    class MockRuntime {
      baseURL: string;
      client: any;

      constructor({ apiKey }: { apiKey?: string }) {
        if (!apiKey) throw { errorType: 'CustomInvalidKey' };
        this.baseURL = 'https://api.test.com';
        this.client = {
          chat: {
            completions: {
              create: vi.fn(),
            },
          },
        };
      }
    }

    const mockParams = {
      Runtime: MockRuntime,
      bizErrorType: 'CustomBizError',
      chatDebugEnv: 'DEBUG_CHAT',
      chatModel: 'test-model',
      defaultBaseURL: 'https://api.test.com',
      invalidErrorType: 'CustomInvalidKey',
      provider: 'test-provider',
    };

    // This shouldn't throw
    expect(() => testProvider(mockParams)).not.toThrow();
  });
});
