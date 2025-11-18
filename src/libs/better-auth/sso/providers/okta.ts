import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_OKTA_ID,
      clientSecret: authEnv.AUTH_OKTA_SECRET,
      issuer: authEnv.AUTH_OKTA_ISSUER,
      providerId: 'okta',
    }),
  id: 'okta',
  type: 'generic',
};

export default provider;
