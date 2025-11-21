import type { GenericOAuthConfig } from 'better-auth/plugins';
import type { SocialProviders } from 'better-auth/social-providers';

import { authEnv } from '@/envs/auth';
import { parseSSOProviders } from '@/libs/better-auth/utils';

import Auth0 from './providers/auth0';
import Authelia from './providers/authelia';
import Authentik from './providers/authentik';
import Casdoor from './providers/casdoor';
import CloudflareZeroTrust from './providers/cloudflare-zero-trust';
import Cognito from './providers/cognito';
import Feishu from './providers/feishu';
import GenericOIDC from './providers/generic-oidc';
import Github from './providers/github';
import Google from './providers/google';
import Keycloak from './providers/keycloak';
import Logto from './providers/logto';
import Microsoft from './providers/microsoft';
import Okta from './providers/okta';
import Wechat from './providers/wechat';
import Zitadel from './providers/zitadel';
import type { BetterAuthProviderDefinition } from './types';

const providerDefinitions: BetterAuthProviderDefinition[] = [
  Google,
  Github,
  Cognito,
  Microsoft,
  Auth0,
  Authelia,
  Authentik,
  Casdoor,
  CloudflareZeroTrust,
  GenericOIDC,
  Keycloak,
  Logto,
  Okta,
  Zitadel,
  Feishu,
  Wechat,
];

const providerRegistry = new Map<string, BetterAuthProviderDefinition>();

for (const definition of providerDefinitions) {
  providerRegistry.set(definition.id, definition);
  definition.aliases?.forEach((alias) => providerRegistry.set(alias, definition));
}

export const initBetterAuthSSOProviders = () => {
  const enabledProviders = parseSSOProviders(authEnv.BETTER_AUTH_SSO_PROVIDERS);

  const socialProviders: SocialProviders = {};
  const genericOAuthProviders: GenericOAuthConfig[] = [];

  for (const rawProvider of enabledProviders) {
    const definition = providerRegistry.get(rawProvider);

    if (!definition) {
      throw new Error(`[Better-Auth] Unknown SSO provider: ${rawProvider}`);
    }

    /**
     * Providers expose checkEnvs predicates so we can fail fast when credentials are missing instead
     * of encountering harder-to-trace errors later in the Better-Auth pipeline.
     */
    if (!definition.checkEnvs()) {
      throw new Error(
        `[Better-Auth] ${rawProvider} SSO provider environment variables are not set correctly!`,
      );
    }

    if (definition.type === 'builtin') {
      const providerId = definition.id;
      if (socialProviders[providerId]) {
        throw new Error(`[Better-Auth] Duplicate SSO provider: ${providerId}`);
      }

      const config = definition.build();
      if (config) {
        // @ts-expect-error hard to type
        socialProviders[providerId] = config;
      }

      continue;
    }

    const config = definition.build();

    if (config) {
      genericOAuthProviders.push(config);
    }
  }

  return {
    genericOAuthProviders,
    socialProviders: socialProviders,
  };
};
