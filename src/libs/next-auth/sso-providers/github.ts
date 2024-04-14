import GitHub from 'next-auth/providers/github';

import { getServerConfig } from '@/config/server';

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = getServerConfig();

const provider = {
  id: 'github',
  provider: GitHub({
    // Specify auth scope, at least include 'openid email'
    authorization: { params: { scope: 'read:user user:email' } },
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
  }),
};

export default provider;
