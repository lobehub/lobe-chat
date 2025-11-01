import Auth0 from 'next-auth/providers/auth0';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'auth0',
  provider: Auth0({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    // all scopes in Auth0 ref: https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
    authorization: { params: { scope: 'openid email profile' } },
    profile(profile) {
      return {
        email: profile.email,
        id: profile.sub,
        image: profile.picture,
        name: profile.name,
        providerAccountId: profile.sub,
      };
    },
  }),
};

export default provider;
