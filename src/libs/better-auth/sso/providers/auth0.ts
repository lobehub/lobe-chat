import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () => {
    const config = buildOidcConfig({
      clientId: authEnv.AUTH_AUTH0_ID,
      clientSecret: authEnv.AUTH_AUTH0_SECRET,
      issuer: authEnv.AUTH_AUTH0_ISSUER,
      providerId: 'auth0',
    });
    return config;
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_AUTH0_ID && authEnv.AUTH_AUTH0_SECRET && authEnv.AUTH_AUTH0_ISSUER);
  },
  id: 'auth0',
  type: 'generic',
};

export default provider;
