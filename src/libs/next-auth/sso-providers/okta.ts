import Okta from 'next-auth/providers/okta';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'okta',
  provider: Okta({
    ...CommonProviderConfig,
    authorization: { params: { scope: 'openid email profile' } },
    clientId: process.env.AUTH_OKTA_ID,
    clientSecret: process.env.AUTH_OKTA_SECRET,
    issuer: process.env.AUTH_OKTA_ISSUER,
    // Remove End
    profile(profile) {
      return {
        email: profile.email,
        id: profile.sub,
        image: profile.picture,
        name: profile.name ?? profile.preferred_username,
        providerAccountId: profile.sub,
      };
    },
  }),
};

export default provider;
