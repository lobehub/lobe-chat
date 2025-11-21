import { authEnv } from '@/envs/auth';

import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<'github'> = {
  build: () => {
    return {
      clientId: authEnv.GITHUB_CLIENT_ID!,
      clientSecret: authEnv.GITHUB_CLIENT_SECRET!,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.GITHUB_CLIENT_ID && authEnv.GITHUB_CLIENT_SECRET);
  },
  id: 'github',
  type: 'builtin',
};

export default provider;
