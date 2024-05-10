import GitHub from 'next-auth/providers/github';

import { authEnv } from '@/config/auth';

const provider = {
  id: 'github',
  provider: GitHub({
    // Specify auth scope, at least include 'openid email'
    authorization: { params: { scope: 'read:user user:email' } },
    clientId: authEnv.GITHUB_CLIENT_ID,
    clientSecret: authEnv.GITHUB_CLIENT_SECRET,
  }),
};

export default provider;
