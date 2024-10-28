import type { OIDCConfig } from '@auth/core/providers';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

export type AutheliaProfile = {
  // The users display name
  email: string;
  // The users email
  groups: string[];
  // The username the user used to login with
  name: string;
  preferred_username: string; // The users groups
  sub: string; // The users id
};

const provider = {
  id: 'authelia',
  provider: {
    ...CommonProviderConfig,
    authorization: { params: { scope: 'openid email profile' } },
    checks: ['state', 'pkce'],
    clientId: authEnv.AUTHELIA_CLIENT_ID ?? process.env.AUTH_AUTHELIA_ID,
    clientSecret: authEnv.AUTHELIA_CLIENT_SECRET ?? process.env.AUTH_AUTHELIA_SECRET,
    id: 'authelia',
    issuer: authEnv.AUTHELIA_ISSUER ?? process.env.AUTH_AUTHELIA_ISSUER,
    name: 'Authelia',
    profile(profile) {
      return {
        email: profile.email,
        id: profile.sub,
        name: profile.name,
        providerAccountId: profile.sub,
      };
    },
    type: 'oidc',
  } satisfies OIDCConfig<AutheliaProfile>,
};

export default provider;
