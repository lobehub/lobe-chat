import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_KEYCLOAK_ID,
      clientSecret: authEnv.AUTH_KEYCLOAK_SECRET,
      issuer: authEnv.AUTH_KEYCLOAK_ISSUER,
      providerId: 'keycloak',
    }),
  id: 'keycloak',
  type: 'generic',
};

export default provider;
