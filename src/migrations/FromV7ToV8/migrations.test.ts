import { describe, expect, it } from 'vitest';

import { MigrationV7ToV8 } from './index';

const migration = new MigrationV7ToV8();

describe('MigrationV7ToV8', () => {
  it('should migrate Bedrock AKSK to API key format', () => {
    const data = {
      version: 7,
      state: {
        settings: {
          keyVaults: {
            bedrock: {
              accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
              secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
              region: 'us-west-2',
            },
          },
        },
      },
    } as any;

    const result = migration.migrate(data);

    expect(result.state.settings?.keyVaults.bedrock).toEqual({
      apiKey: '',
      baseURL: '',
      region: 'us-west-2',
    });
  });

  it('should preserve existing API key format', () => {
    const data = {
      version: 7,
      state: {
        settings: {
          keyVaults: {
            bedrock: {
              apiKey: 'test-api-key',
              baseURL: 'https://bedrock-runtime.us-east-1.amazonaws.com',
              region: 'us-east-1',
            },
          },
        },
      },
    } as any;

    const result = migration.migrate(data);

    expect(result.state.settings?.keyVaults.bedrock).toEqual({
      apiKey: 'test-api-key',
      baseURL: 'https://bedrock-runtime.us-east-1.amazonaws.com',
      region: 'us-east-1',
    });
  });

  it('should handle missing bedrock keyVault', () => {
    const data = {
      version: 7,
      state: {
        settings: {
          keyVaults: {},
        },
      },
    } as any;

    const result = migration.migrate(data);

    expect(result.state.settings?.keyVaults).toEqual({});
  });
});
