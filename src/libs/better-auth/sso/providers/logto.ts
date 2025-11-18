import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_LOGTO_ID,
      clientSecret: authEnv.AUTH_LOGTO_SECRET,
      issuer: authEnv.AUTH_LOGTO_ISSUER,
      providerId: 'logto',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
    }),
  id: 'logto',
  type: 'generic',
};

export default provider;
