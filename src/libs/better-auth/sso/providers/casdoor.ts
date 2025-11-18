import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_CASDOOR_ID,
      clientSecret: authEnv.AUTH_CASDOOR_SECRET,
      issuer: authEnv.AUTH_CASDOOR_ISSUER,
      providerId: 'casdoor',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_CASDOOR_ID &&
      authEnv.AUTH_CASDOOR_SECRET &&
      authEnv.AUTH_CASDOOR_ISSUER
    );
  },
  id: 'casdoor',
  type: 'generic',
};

export default provider;
