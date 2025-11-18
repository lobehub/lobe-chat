import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_LOGTO_ID,
      clientSecret: authEnv.AUTH_LOGTO_SECRET,
      issuer: authEnv.AUTH_LOGTO_ISSUER,
      providerId: 'logto',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
    }),
  checkEnvs: () => {
    return !!(authEnv.AUTH_LOGTO_ID && authEnv.AUTH_LOGTO_SECRET && authEnv.AUTH_LOGTO_ISSUER);
  },
  id: 'logto',
  type: 'generic',
};

export default provider;
