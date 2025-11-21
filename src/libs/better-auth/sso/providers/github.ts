import { authEnv } from '@/envs/auth';

import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  },
  'github'
> = {
  build: (env) => {
    return {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.GITHUB_CLIENT_ID && authEnv.GITHUB_CLIENT_SECRET)
      ? {
          GITHUB_CLIENT_ID: authEnv.GITHUB_CLIENT_ID,
          GITHUB_CLIENT_SECRET: authEnv.GITHUB_CLIENT_SECRET,
        }
      : false;
  },
  id: 'github',
  type: 'builtin',
};

export default provider;
