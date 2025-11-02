import type { OIDCConfig } from '@auth/core/providers';

import { CommonProviderConfig } from './sso.config';

export type GenericOIDCProfile = {
  email: string;
  id?: string;
  name?: string;
  picture?: string;
  sub: string;
  username?: string;
};

const provider = {
  id: 'generic-oidc',
  provider: {
    ...CommonProviderConfig,
    authorization: { params: { scope: 'email openid profile' } },
    checks: ['state', 'pkce'],
    clientId: process.env.AUTH_GENERIC_OIDC_ID,
    clientSecret: process.env.AUTH_GENERIC_OIDC_SECRET,
    id: 'generic-oidc',
    issuer: process.env.AUTH_GENERIC_OIDC_ISSUER,
    name: 'Generic OIDC',
    profile(profile) {
      return {
        email: profile.email,
        id: profile.sub,
        image: profile.picture,
        name: profile.name ?? profile.username ?? profile.email,
        providerAccountId: profile.sub,
      };
    },
    type: 'oidc',
  } satisfies OIDCConfig<GenericOIDCProfile>,
};

export default provider;
