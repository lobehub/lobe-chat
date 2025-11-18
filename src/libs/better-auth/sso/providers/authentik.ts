import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_AUTHENTIK_ID,
      clientSecret: authEnv.AUTH_AUTHENTIK_SECRET,
      issuer: authEnv.AUTH_AUTHENTIK_ISSUER,
      providerId: 'authentik',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_AUTHENTIK_ID &&
      authEnv.AUTH_AUTHENTIK_SECRET &&
      authEnv.AUTH_AUTHENTIK_ISSUER
    );
  },
  id: 'authentik',
  type: 'generic',
};

export default provider;
