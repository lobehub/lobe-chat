import { authEnv } from '@/envs/auth';

import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<'google'> = {
  build: () => {
    return {
      clientId: authEnv.GOOGLE_CLIENT_ID!,
      clientSecret: authEnv.GOOGLE_CLIENT_SECRET!,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET);
  },
  id: 'google',
  type: 'builtin',
};

export default provider;
