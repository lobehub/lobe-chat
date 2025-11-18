import { authEnv } from '@/envs/auth';

import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<'github'> = {
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
  checkEnvs: () => {
    return !!(authEnv.GITHUB_CLIENT_ID && authEnv.GITHUB_CLIENT_SECRET);
  },
  id: 'github',
  type: 'builtin',
};

export default provider;
