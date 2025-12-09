import Okta from 'next-auth/providers/okta';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'okta',
  provider: Okta({
    ...CommonProviderConfig,
    authorization: { params: { scope: 'openid email profile' } },
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
