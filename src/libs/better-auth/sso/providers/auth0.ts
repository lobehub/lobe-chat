import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () => {
    const config = buildOidcConfig({
      clientId: authEnv.AUTH_AUTH0_ID,
      clientSecret: authEnv.AUTH_AUTH0_SECRET,
      issuer: authEnv.AUTH_AUTH0_ISSUER,
      providerId: 'auth0',
    });
    return config;
  },
  id: 'auth0',
  type: 'generic',
};

export default provider;
