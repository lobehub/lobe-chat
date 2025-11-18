import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_GENERIC_OIDC_ID,
      clientSecret: authEnv.AUTH_GENERIC_OIDC_SECRET,
      issuer: authEnv.AUTH_GENERIC_OIDC_ISSUER,
      providerId: 'generic-oidc',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_GENERIC_OIDC_ID &&
      authEnv.AUTH_GENERIC_OIDC_SECRET &&
      authEnv.AUTH_GENERIC_OIDC_ISSUER
    );
  },
  id: 'generic-oidc',
  type: 'generic',
};

export default provider;
