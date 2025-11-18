import { authEnv } from '@/envs/auth';

import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<'google'> = {
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
  checkEnvs: () => {
    return !!(authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET);
  },
  id: 'google',
  type: 'builtin',
};

export default provider;
