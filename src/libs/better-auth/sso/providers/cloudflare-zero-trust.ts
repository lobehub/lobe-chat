import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_ID,
      clientSecret: authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_SECRET,
      issuer: authEnv.AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER,
      providerId: 'cloudflare-zero-trust',
    }),
  id: 'cloudflare-zero-trust',
  type: 'generic',
};

export default provider;
