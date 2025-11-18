import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_AUTHENTIK_ID,
      clientSecret: authEnv.AUTH_AUTHENTIK_SECRET,
      issuer: authEnv.AUTH_AUTHENTIK_ISSUER,
      providerId: 'authentik',
    }),
  id: 'authentik',
  type: 'generic',
};

export default provider;
