import { authEnv } from '@/envs/auth';

import { buildOidcConfig, pickEnv } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: pickEnv(authEnv.ZITADEL_CLIENT_ID, authEnv.AUTH_ZITADEL_ID),
      clientSecret: pickEnv(authEnv.ZITADEL_CLIENT_SECRET, authEnv.AUTH_ZITADEL_SECRET),
      issuer: pickEnv(authEnv.ZITADEL_ISSUER, authEnv.AUTH_ZITADEL_ISSUER),
      providerId: 'zitadel',
    }),
  checkEnvs: () => {
    return !!(authEnv.ZITADEL_CLIENT_ID && authEnv.ZITADEL_CLIENT_SECRET && authEnv.ZITADEL_ISSUER);
  },
  id: 'zitadel',
  type: 'generic',
};

export default provider;
