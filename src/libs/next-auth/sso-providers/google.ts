import Google from 'next-auth/providers/google';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'google',
  provider: Google({
    ...CommonProviderConfig,
    authorization: {
      params: {
        scope:
          'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
      },
    },
  }),
};

export default provider;
