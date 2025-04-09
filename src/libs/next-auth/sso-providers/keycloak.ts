import Keycloak from 'next-auth/providers/keycloak';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'keycloak',
  provider: Keycloak({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    authorization: { params: { scope: 'openid email profile' } },
    // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
    clientId: authEnv.KEYCLOAK_CLIENT_ID ?? process.env.AUTH_KEYCLOAK_ID,
    clientSecret: authEnv.KEYCLOAK_CLIENT_SECRET ?? process.env.AUTH_KEYCLOAK_SECRET,
    issuer: authEnv.KEYCLOAK_ISSUER ?? process.env.AUTH_KEYCLOAK_ISSUER,
    // Remove End
    profile(profile) {
      return {
        email: profile.email,
        id: profile.sub,
        name: profile.name,
        providerAccountId: profile.sub,
      };
    },
  }),
};

export default provider;
