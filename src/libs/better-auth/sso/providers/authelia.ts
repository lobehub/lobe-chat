import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_AUTHELIA_ID,
      clientSecret: authEnv.AUTH_AUTHELIA_SECRET,
      issuer: authEnv.AUTH_AUTHELIA_ISSUER,
      providerId: 'authelia',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_AUTHELIA_ID &&
      authEnv.AUTH_AUTHELIA_SECRET &&
      authEnv.AUTH_AUTHELIA_ISSUER
    );
  },
  id: 'authelia',
  type: 'generic',
};

export default provider;
