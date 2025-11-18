import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_ID,
      clientSecret: authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_SECRET,
      issuer: authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER,
      providerId: 'cloudflare-zero-trust',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_ID &&
      authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_SECRET &&
      authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER
    );
  },
  id: 'cloudflare-zero-trust',
  type: 'generic',
};

export default provider;
