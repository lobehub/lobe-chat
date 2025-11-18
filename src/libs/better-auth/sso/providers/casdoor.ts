import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_CASDOOR_ID,
      clientSecret: authEnv.AUTH_CASDOOR_SECRET,
      issuer: authEnv.AUTH_CASDOOR_ISSUER,
      overrides: {
        mapProfileToUser: (profile) => {
          const composedName = [profile.firstName, profile.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();
          const fallbackName = composedName.length > 0 ? composedName : undefined;

          return {
            email: profile.email,
            emailVerified: Boolean(profile.emailVerified),
            image: profile.avatar ?? profile.permanentAvatar,
            name:
              profile.displayName ?? fallbackName ?? profile.name ?? profile.email ?? profile.id,
          };
        },
      },
      providerId: 'casdoor',
    }),
  checkEnvs: () => {
    return !!(
      authEnv.AUTH_CASDOOR_ID &&
      authEnv.AUTH_CASDOOR_SECRET &&
      authEnv.AUTH_CASDOOR_ISSUER
    );
  },
  id: 'casdoor',
  type: 'generic',
};

export default provider;
