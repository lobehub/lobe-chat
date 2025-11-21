import { authEnv } from '@/envs/auth';

import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  },
  'google'
> = {
  build: (env) => {
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET)
      ? {
          GOOGLE_CLIENT_ID: authEnv.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: authEnv.GOOGLE_CLIENT_SECRET,
        }
      : false;
  },
  id: 'google',
  type: 'builtin',
};

export default provider;
