import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_GENERIC_OIDC_ID,
      clientSecret: authEnv.AUTH_GENERIC_OIDC_SECRET,
      issuer: authEnv.AUTH_GENERIC_OIDC_ISSUER,
      providerId: 'generic-oidc',
    }),
  id: 'generic-oidc',
  type: 'generic',
};

export default provider;
