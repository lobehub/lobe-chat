import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const CASDOOR_AUTHORIZATION_PATH = '/login/oauth/authorize';
const CASDOOR_TOKEN_PATH = '/api/login/oauth/access_token';
const CASDOOR_USERINFO_PATH = '/api/userinfo';

const resolveCasdoorUrl = (path: string) => {
  const issuer = authEnv.AUTH_CASDOOR_ISSUER?.trim();
  if (!issuer) return undefined;
  try {
    const url = new URL(issuer);
    url.pathname = path;
    url.search = '';
    return url.toString();
  } catch {
    return `${issuer.replace(/\/$/, '')}${path}`;
  }
};

const provider: GenericProviderDefinition = {
  build: () =>
    buildOidcConfig({
      clientId: authEnv.AUTH_CASDOOR_ID,
      clientSecret: authEnv.AUTH_CASDOOR_SECRET,
      issuer: authEnv.AUTH_CASDOOR_ISSUER,
      overrides: {
        authorizationUrl: resolveCasdoorUrl(CASDOOR_AUTHORIZATION_PATH),
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
        tokenUrl: resolveCasdoorUrl(CASDOOR_TOKEN_PATH),
        userInfoUrl: resolveCasdoorUrl(CASDOOR_USERINFO_PATH),
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
