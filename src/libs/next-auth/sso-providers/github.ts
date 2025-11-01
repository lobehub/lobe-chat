import GitHub from 'next-auth/providers/github';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'github',
  provider: GitHub({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    authorization: { params: { scope: 'read:user user:email' } },
    profile: (profile) => {
      return {
        email: profile.email,
        id: profile.id.toString(),
        image: profile.avatar_url,
        name: profile.name,
        providerAccountId: profile.id.toString(),
      };
    },
  }),
};

export default provider;
