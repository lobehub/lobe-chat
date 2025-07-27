import Keycloak from 'next-auth/providers/keycloak';

import { CommonProviderConfig } from './sso.config';

export const keycloak = Keycloak({
  ...CommonProviderConfig,
  // Specify auth scope, at least include 'openid email'
  authorization: { params: { scope: 'openid email profile' } },
  clientId: process.env.AUTH_KEYCLOAK_ID,
  clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
  issuer: process.env.AUTH_KEYCLOAK_ISSUER,
  profile(profile) {
    return {
      email: profile.email,
      id: profile.sub,
      name: profile.name,
      providerAccountId: profile.sub,
    };
  },
});
