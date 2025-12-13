import { authEnv } from '@/envs/auth';

import { pickEnv } from '../helpers';
import type { BuiltinProviderDefinition } from '../types';

type MicrosoftEnv = {
  AUTH_AZURE_AD_ID?: string;
  AUTH_AZURE_AD_SECRET?: string;
  AUTH_MICROSOFT_ENTRA_ID_ID?: string;
  AUTH_MICROSOFT_ENTRA_ID_SECRET?: string;
  AUTH_MICROSOFT_ID?: string;
  AUTH_MICROSOFT_SECRET?: string;
  AZURE_AD_CLIENT_ID?: string;
  AZURE_AD_CLIENT_SECRET?: string;
};

const getClientId = (env: MicrosoftEnv) => {
  return pickEnv(
    env.AUTH_MICROSOFT_ID,
    env.AUTH_MICROSOFT_ENTRA_ID_ID,
    env.AUTH_AZURE_AD_ID,
    env.AZURE_AD_CLIENT_ID,
  );
};

const getClientSecret = (env: MicrosoftEnv) => {
  return pickEnv(
    env.AUTH_MICROSOFT_SECRET,
    env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    env.AUTH_AZURE_AD_SECRET,
    env.AZURE_AD_CLIENT_SECRET,
  );
};

const provider: BuiltinProviderDefinition<MicrosoftEnv, 'microsoft'> = {
  aliases: ['microsoft-entra-id'],
  build: (env) => {
    const clientId = getClientId(env)!;
    const clientSecret = getClientSecret(env)!;
    return {
      clientId,
      clientSecret,
    };
  },
  checkEnvs: () => {
    const clientId = getClientId(authEnv);
    const clientSecret = getClientSecret(authEnv);
    return !!(clientId && clientSecret)
      ? {
          AUTH_AZURE_AD_ID: authEnv.AUTH_AZURE_AD_ID,
          AUTH_AZURE_AD_SECRET: authEnv.AUTH_AZURE_AD_SECRET,
          AUTH_MICROSOFT_ENTRA_ID_ID: authEnv.AUTH_MICROSOFT_ENTRA_ID_ID,
          AUTH_MICROSOFT_ENTRA_ID_SECRET: authEnv.AUTH_MICROSOFT_ENTRA_ID_SECRET,
          AUTH_MICROSOFT_ID: authEnv.AUTH_MICROSOFT_ID,
          AUTH_MICROSOFT_SECRET: authEnv.AUTH_MICROSOFT_SECRET,
          AZURE_AD_CLIENT_ID: authEnv.AZURE_AD_CLIENT_ID,
          AZURE_AD_CLIENT_SECRET: authEnv.AZURE_AD_CLIENT_SECRET,
        }
      : false;
  },
  id: 'microsoft',
  type: 'builtin',
};

export default provider;
