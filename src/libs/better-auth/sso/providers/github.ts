import { authEnv } from '@/envs/auth';

import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () => {
    if (authEnv.GITHUB_CLIENT_ID && authEnv.GITHUB_CLIENT_SECRET) {
      return {
        clientId: authEnv.GITHUB_CLIENT_ID,
        clientSecret: authEnv.GITHUB_CLIENT_SECRET,
      };
    }

    console.warn(`[Better-Auth] GitHub OAuth enabled but missing credentials`);
    return undefined;
  },
  id: 'github',
  type: 'social',
};

export default provider;
