import { authEnv } from '@/envs/auth';

import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    COGNITO_CLIENT_ID: string;
    COGNITO_CLIENT_SECRET: string;
    COGNITO_DOMAIN: string;
    COGNITO_REGION: string;
    COGNITO_USERPOOL_ID: string;
  },
  'cognito'
> = {
  build: (env) => {
    return {
      clientId: env.COGNITO_CLIENT_ID,
      clientSecret: env.COGNITO_CLIENT_SECRET,
      domain: env.COGNITO_DOMAIN,
      region: env.COGNITO_REGION,
      userPoolId: env.COGNITO_USERPOOL_ID,
    };
  },
  checkEnvs: () => {
    return !!(
      authEnv.COGNITO_CLIENT_ID &&
      authEnv.COGNITO_CLIENT_SECRET &&
      authEnv.COGNITO_DOMAIN &&
      authEnv.COGNITO_REGION &&
      authEnv.COGNITO_USERPOOL_ID
    )
      ? {
          COGNITO_CLIENT_ID: authEnv.COGNITO_CLIENT_ID,
          COGNITO_CLIENT_SECRET: authEnv.COGNITO_CLIENT_SECRET,
          COGNITO_DOMAIN: authEnv.COGNITO_DOMAIN,
          COGNITO_REGION: authEnv.COGNITO_REGION,
          COGNITO_USERPOOL_ID: authEnv.COGNITO_USERPOOL_ID,
        }
      : false;
  },
  id: 'cognito',
  type: 'builtin',
};

export default provider;
