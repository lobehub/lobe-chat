import GitHub from 'next-auth/providers/github';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'github',
  provider: GitHub({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    authorization: { params: { scope: 'read:user user:email' } },
    // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
    clientId: authEnv.GITHUB_CLIENT_ID ?? process.env.AUTH_GITHUB_ID,
    clientSecret: authEnv.GITHUB_CLIENT_SECRET ?? process.env.AUTH_GITHUB_SECRET,
    // Remove end
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
