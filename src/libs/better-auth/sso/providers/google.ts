import { authEnv } from '@/envs/auth';

import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () => {
    if (authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET) {
      return {
        clientId: authEnv.GOOGLE_CLIENT_ID,
        clientSecret: authEnv.GOOGLE_CLIENT_SECRET,
      };
    }

    console.warn(`[Better-Auth] Google OAuth enabled but missing credentials`);
    return undefined;
  },
  id: 'google',
  type: 'social',
};

export default provider;
