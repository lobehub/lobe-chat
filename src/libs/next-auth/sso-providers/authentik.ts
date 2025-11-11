import Authentik from 'next-auth/providers/authentik';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'authentik',
  provider: Authentik({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    // all scopes in Authentik ref: https://goauthentik.io/docs/providers/oauth2
    authorization: { params: { scope: 'openid email profile' } },
    // TODO(NextAuth): map unique user id to `providerAccountId` field
    //  profile(profile) {
    //   return {
    //     email: profile.email,
    //     image: profile.picture,
    //     name: profile.name,
    //     providerAccountId: profile.user_id,
    //     id: profile.user_id,
    //   };
    // },
  }),
};

export default provider;
