import type { OIDCConfig } from '@auth/core/providers';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'authelia',
  provider: {
    ...CommonProviderConfig,
    authorization: { params: { scope: 'openid email profile' } },
    checks: ['state', 'pkce'],
    clientId: authEnv.AUTHELIA_CLIENT_ID,
    clientSecret: authEnv.AUTHELIA_CLIENT_SECRET,
    id: 'authelia',
    issuer: authEnv.AUTHELIA_ISSUER,
    name: 'Authelia',
    type: 'oidc',
  } satisfies OIDCConfig<unknown>,
};

export default provider;
