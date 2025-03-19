import Okta from 'next-auth/providers/okta';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'okta',
  provider: Okta({
    ...CommonProviderConfig,
    authorization: { params: { scope: 'openid email profile' } },
    clientId: authEnv.OKTA_CLIENT_ID ?? process.env.AUTH_OKTA_ID,
    clientSecret: authEnv.OKTA_CLIENT_SECRET ?? process.env.AUTH_OKTA_SECRET,
    issuer: authEnv.OKTA_ISSUER ?? process.env.AUTH_OKTA_ISSUER,
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
