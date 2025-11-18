import { authEnv } from '@/envs/auth';

import { pickEnv } from '../helpers';
import type { BuiltinProviderDefinition } from '../types';

const getClientId = () => {
  return pickEnv(
    authEnv.MICROSOFT_CLIENT_ID,
    authEnv.AUTH_MICROSOFT_ENTRA_ID_ID,
    authEnv.AUTH_AZURE_AD_ID,
    authEnv.AZURE_AD_CLIENT_ID,
  );
};

const getClientSecret = () => {
  return pickEnv(
    authEnv.MICROSOFT_CLIENT_SECRET,
    authEnv.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    authEnv.AUTH_AZURE_AD_SECRET,
    authEnv.AZURE_AD_CLIENT_SECRET,
  );
};

const provider: BuiltinProviderDefinition<'microsoft'> = {
  aliases: ['microsoft-entra-id'],
  build: () => {
    const clientId = getClientId()!;
    const clientSecret = getClientSecret()!;
    return {
      clientId,
      clientSecret,
    };
  },
  checkEnvs: () => {
    const clientId = getClientId();
    const clientSecret = getClientSecret();
    return !!(clientId && clientSecret);
  },
  id: 'microsoft',
  type: 'builtin',
};

export default provider;
