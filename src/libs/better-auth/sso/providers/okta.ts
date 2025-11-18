import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_OKTA_ID,
      clientSecret: authEnv.AUTH_OKTA_SECRET,
      issuer: authEnv.AUTH_OKTA_ISSUER,
      providerId: 'okta',
    }),
  checkEnvs: () => {
    return !!(authEnv.AUTH_OKTA_ID && authEnv.AUTH_OKTA_SECRET && authEnv.AUTH_OKTA_ISSUER);
  },
  id: 'okta',
  type: 'generic',
};

export default provider;
