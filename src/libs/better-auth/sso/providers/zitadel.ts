import { authEnv } from '@/envs/auth';

import { buildOidcConfig, pickEnv } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: pickEnv(authEnv.ZITADEL_CLIENT_ID, authEnv.AUTH_ZITADEL_ID),
      clientSecret: pickEnv(authEnv.ZITADEL_CLIENT_SECRET, authEnv.AUTH_ZITADEL_SECRET),
      issuer: pickEnv(authEnv.ZITADEL_ISSUER, authEnv.AUTH_ZITADEL_ISSUER),
      providerId: 'zitadel',
    }),
  id: 'zitadel',
  type: 'generic',
};

export default provider;
