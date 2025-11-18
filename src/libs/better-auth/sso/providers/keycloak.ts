import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_KEYCLOAK_ID,
      clientSecret: authEnv.AUTH_KEYCLOAK_SECRET,
      issuer: authEnv.AUTH_KEYCLOAK_ISSUER,
      providerId: 'keycloak',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_KEYCLOAK_ID &&
      authEnv.AUTH_KEYCLOAK_SECRET &&
      authEnv.AUTH_KEYCLOAK_ISSUER
    );
  },
  id: 'keycloak',
  type: 'generic',
};

export default provider;
