import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_CASDOOR_ID,
      clientSecret: authEnv.AUTH_CASDOOR_SECRET,
      issuer: authEnv.AUTH_CASDOOR_ISSUER,
      providerId: 'casdoor',
    }),
  id: 'casdoor',
  type: 'generic',
};

export default provider;
