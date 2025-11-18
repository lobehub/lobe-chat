import { authEnv } from '@/envs/auth';

import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () => {
    if (
      authEnv.COGNITO_CLIENT_ID &&
      authEnv.COGNITO_CLIENT_SECRET &&
      authEnv.COGNITO_DOMAIN &&
      authEnv.COGNITO_REGION &&
      authEnv.COGNITO_USERPOOL_ID
    ) {
      return {
        clientId: authEnv.COGNITO_CLIENT_ID,
        clientSecret: authEnv.COGNITO_CLIENT_SECRET,
        domain: authEnv.COGNITO_DOMAIN,
        region: authEnv.COGNITO_REGION,
        userPoolId: authEnv.COGNITO_USERPOOL_ID,
      };
    }

    console.warn(`[Better-Auth] AWS Cognito OAuth enabled but missing credentials`);
    return undefined;
  },
  id: 'cognito',
  type: 'social',
};

export default provider;
