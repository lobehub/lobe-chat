import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_AUTHELIA_ID,
      clientSecret: authEnv.AUTH_AUTHELIA_SECRET,
      issuer: authEnv.AUTH_AUTHELIA_ISSUER,
      providerId: 'authelia',
    }),
  id: 'authelia',
  type: 'generic',
};

export default provider;
