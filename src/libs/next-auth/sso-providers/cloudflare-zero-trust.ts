import type { OIDCConfig } from '@auth/core/providers';

import { authEnv } from '@/envs/auth';

import { CommonProviderConfig } from './sso.config';

export type CloudflareZeroTrustProfile = {
  email: string;
  name: string;
  sub: string;
};

const provider = {
  id: 'cloudflare-zero-trust',
  provider: {
    ...CommonProviderConfig,
    authorization: { params: { scope: 'openid email profile' } },
    checks: ['state', 'pkce'],
    clientId: authEnv.CLOUDFLARE_ZERO_TRUST_CLIENT_ID ?? process.env.AUTH_CLOUDFLARE_ZERO_TRUST_ID,
    clientSecret:
      authEnv.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET ?? process.env.AUTH_CLOUDFLARE_ZERO_TRUST_SECRET,
    id: 'cloudflare-zero-trust',
    issuer: authEnv.CLOUDFLARE_ZERO_TRUST_ISSUER ?? process.env.AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER,
    name: 'Cloudflare Zero Trust',
    profile(profile) {
      return {
        email: profile.email,
        id: profile.sub,
        name: profile.name ?? profile.email,
        providerAccountId: profile.sub,
      };
    },
    type: 'oidc',
  } satisfies OIDCConfig<CloudflareZeroTrustProfile>,
};

export default provider;
