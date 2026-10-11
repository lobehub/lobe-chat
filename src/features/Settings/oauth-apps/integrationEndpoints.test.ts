import { describe, expect, it } from 'vitest';

import { getIntegrationEndpoints } from './integrationEndpoints';

describe('getIntegrationEndpoints', () => {
  it('gives a web app the authorization-code endpoints', () => {
    expect(getIntegrationEndpoints('https://app.lobehub.com', 'web')).toEqual([
      { key: 'issuer', url: 'https://app.lobehub.com/oidc' },
      {
        key: 'discovery',
        url: 'https://app.lobehub.com/oidc/.well-known/openid-configuration',
      },
      { key: 'authorization', url: 'https://app.lobehub.com/oidc/auth' },
      { key: 'token', url: 'https://app.lobehub.com/oidc/token' },
    ]);
  });

  it('gives a device app the device authorization endpoint instead', () => {
    const keys = getIntegrationEndpoints('http://localhost:3010/', 'native').map((e) => e.key);

    expect(keys).toEqual(['issuer', 'discovery', 'deviceAuthorization', 'token']);
    expect(getIntegrationEndpoints('http://localhost:3010/', 'native')[2].url).toBe(
      'http://localhost:3010/oidc/device/auth',
    );
  });
});
