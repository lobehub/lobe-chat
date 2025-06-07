import Google from 'next-auth/providers/google';

import { authEnv } from '@/config/auth';

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
    // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
    clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
    clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
  }),
};

export default provider;
