import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_GENERIC_OIDC_ID,
      clientSecret: authEnv.AUTH_GENERIC_OIDC_SECRET,
      issuer: authEnv.AUTH_GENERIC_OIDC_ISSUER,
      overrides: {
        /**
         * Mirror NextAuth's fallback that prefers name -> username -> email so Better Auth never
         * fails with name_is_missing when upstream profiles only expose username/email fields.
         */
        mapProfileToUser: (profile) => ({
          name: profile.name ?? profile.username ?? profile.email ?? profile.id,
        }),
      },
      providerId: 'generic-oidc',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_GENERIC_OIDC_ID &&
      authEnv.AUTH_GENERIC_OIDC_SECRET &&
      authEnv.AUTH_GENERIC_OIDC_ISSUER
    );
  },
  id: 'generic-oidc',
  type: 'generic',
};

export default provider;
