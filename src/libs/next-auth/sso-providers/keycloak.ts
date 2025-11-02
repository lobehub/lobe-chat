import Keycloak from 'next-auth/providers/keycloak';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'keycloak',
  provider: Keycloak({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    authorization: { params: { scope: 'openid email profile' } },
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
