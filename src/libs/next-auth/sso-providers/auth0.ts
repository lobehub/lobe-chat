import Auth0 from 'next-auth/providers/auth0';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'auth0',
  provider: Auth0({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    // all scopes in Auth0 ref: https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
    authorization: { params: { scope: 'openid email profile' } },
    clientId: authEnv.AUTH0_CLIENT_ID,
    clientSecret: authEnv.AUTH0_CLIENT_SECRET,
    issuer: authEnv.AUTH0_ISSUER,
    profile(profile) {
      return {
        email: profile.email,
        image: profile.picture,
        name: profile.name,
        providerAccountId: profile.sub,
      };
    },
  }),
};

export default provider;
