import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import type { GenericProviderDefinition } from '../types';

const CASDOOR_AUTHORIZATION_PATH = '/login/oauth/authorize';
const CASDOOR_TOKEN_PATH = '/api/login/oauth/access_token';
const CASDOOR_USERINFO_PATH = '/api/userinfo';

const resolveCasdoorUrl = (issuer: string | undefined, path: string) => {
  const trimmedIssuer = issuer?.trim();
  if (!trimmedIssuer) return undefined;
  try {
    const url = new URL(trimmedIssuer);
    url.pathname = path;
    url.search = '';
    return url.toString();
  } catch {
    return `${trimmedIssuer.replace(/\/$/, '')}${path}`;
  }
};

const provider: GenericProviderDefinition<{
  AUTH_CASDOOR_ID: string;
  AUTH_CASDOOR_ISSUER: string;
  AUTH_CASDOOR_SECRET: string;
}> = {
  build: (env) =>
    buildOidcConfig({
      clientId: env.AUTH_CASDOOR_ID,
      clientSecret: env.AUTH_CASDOOR_SECRET,
      issuer: env.AUTH_CASDOOR_ISSUER,
      overrides: {
        authorizationUrl: resolveCasdoorUrl(env.AUTH_CASDOOR_ISSUER, CASDOOR_AUTHORIZATION_PATH),
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
        tokenUrl: resolveCasdoorUrl(env.AUTH_CASDOOR_ISSUER, CASDOOR_TOKEN_PATH),
        userInfoUrl: resolveCasdoorUrl(env.AUTH_CASDOOR_ISSUER, CASDOOR_USERINFO_PATH),
      },
      providerId: 'casdoor',
    }),
  checkEnvs: () => {
    return !!(authEnv.AUTH_CASDOOR_ID && authEnv.AUTH_CASDOOR_SECRET && authEnv.AUTH_CASDOOR_ISSUER)
      ? {
          AUTH_CASDOOR_ID: authEnv.AUTH_CASDOOR_ID,
          AUTH_CASDOOR_ISSUER: authEnv.AUTH_CASDOOR_ISSUER,
          AUTH_CASDOOR_SECRET: authEnv.AUTH_CASDOOR_SECRET,
        }
      : false;
  },
  id: 'casdoor',
  type: 'generic',
};

export default provider;
