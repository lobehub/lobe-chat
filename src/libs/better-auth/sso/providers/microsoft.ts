import { authEnv } from '@/envs/auth';

import { pickEnv } from '../helpers';
import type { BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<'microsoft'> = {
  aliases: ['microsoft-entra-id'],
  build: () => {
    const clientId = pickEnv(
      authEnv.MICROSOFT_CLIENT_ID,
      authEnv.AUTH_MICROSOFT_ENTRA_ID_ID,
      authEnv.AUTH_AZURE_AD_ID,
      authEnv.AZURE_AD_CLIENT_ID,
    );
    const clientSecret = pickEnv(
      authEnv.MICROSOFT_CLIENT_SECRET,
      authEnv.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      authEnv.AUTH_AZURE_AD_SECRET,
      authEnv.AZURE_AD_CLIENT_SECRET,
    );

    if (clientId && clientSecret) {
      return {
        clientId,
        clientSecret,
      };
    }

    console.warn(`[Better-Auth] Microsoft OAuth enabled but missing credentials`);
    return undefined;
  },
  checkEnvs: () => {
    return !!(authEnv.MICROSOFT_CLIENT_ID && authEnv.MICROSOFT_CLIENT_SECRET);
  },
  id: 'microsoft',
  type: 'builtin',
};

export default provider;
