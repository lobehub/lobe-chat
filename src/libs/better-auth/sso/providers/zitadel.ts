import { authEnv } from '@/envs/auth';

import { buildOidcConfig, pickEnv } from '../helpers';
import type { GenericProviderDefinition } from '../types';

type ZitadelEnv = {
  AUTH_ZITADEL_ID?: string;
  AUTH_ZITADEL_ISSUER?: string;
  AUTH_ZITADEL_SECRET?: string;
  ZITADEL_CLIENT_ID?: string;
  ZITADEL_CLIENT_SECRET?: string;
  ZITADEL_ISSUER?: string;
};

const getClientId = (env: ZitadelEnv) => {
  return pickEnv(env.ZITADEL_CLIENT_ID, env.AUTH_ZITADEL_ID);
};

const getClientSecret = (env: ZitadelEnv) => {
  return pickEnv(env.ZITADEL_CLIENT_SECRET, env.AUTH_ZITADEL_SECRET);
};

const getIssuer = (env: ZitadelEnv) => {
  return pickEnv(env.ZITADEL_ISSUER, env.AUTH_ZITADEL_ISSUER);
};

const provider: GenericProviderDefinition<ZitadelEnv> = {
  build: (env) =>
    buildOidcConfig({
      clientId: getClientId(env)!,
      clientSecret: getClientSecret(env)!,
      issuer: getIssuer(env)!,
      providerId: 'zitadel',
    }),
  checkEnvs: () => {
    const clientId = getClientId(authEnv);
    const clientSecret = getClientSecret(authEnv);
    const issuer = getIssuer(authEnv);
    return !!(clientId && clientSecret && issuer)
      ? {
          AUTH_ZITADEL_ID: authEnv.AUTH_ZITADEL_ID,
          AUTH_ZITADEL_ISSUER: authEnv.AUTH_ZITADEL_ISSUER,
          AUTH_ZITADEL_SECRET: authEnv.AUTH_ZITADEL_SECRET,
          ZITADEL_CLIENT_ID: authEnv.ZITADEL_CLIENT_ID,
          ZITADEL_CLIENT_SECRET: authEnv.ZITADEL_CLIENT_SECRET,
          ZITADEL_ISSUER: authEnv.ZITADEL_ISSUER,
        }
      : false;
  },
  id: 'zitadel',
  type: 'generic',
};

export default provider;
