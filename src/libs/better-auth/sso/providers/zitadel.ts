import { authEnv } from '@/envs/auth';

import { buildOidcConfig, pickEnv } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const getClientId = () => {
  return pickEnv(authEnv.ZITADEL_CLIENT_ID, authEnv.AUTH_ZITADEL_ID);
};

const getClientSecret = () => {
  return pickEnv(authEnv.ZITADEL_CLIENT_SECRET, authEnv.AUTH_ZITADEL_SECRET);
};

const getIssuer = () => {
  return pickEnv(authEnv.ZITADEL_ISSUER, authEnv.AUTH_ZITADEL_ISSUER);
};

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: getClientId()!,
      clientSecret: getClientSecret()!,
      issuer: getIssuer()!,
      providerId: 'zitadel',
    }),
  checkEnvs: () => {
    const clientId = getClientId();
    const clientSecret = getClientSecret();
    const issuer = getIssuer();
    return !!(clientId && clientSecret && issuer);
  },
  id: 'zitadel',
  type: 'generic',
};

export default provider;
