import type { GenericOAuthConfig } from 'better-auth/plugins';
import type { SocialProviders } from 'better-auth/social-providers';

export type BuiltinProviderDefinition<Id extends keyof SocialProviders = keyof SocialProviders> = {
  aliases?: string[];
  build: () => SocialProviders[Id];
  checkEnvs: () => boolean;
  id: Id;
  type: 'builtin';
};

export type GenericProviderDefinition = {
  aliases?: string[];
  build: () => GenericOAuthConfig;
  checkEnvs: () => boolean;
  id: string;
  type: 'generic';
};

export type BetterAuthProviderDefinition = BuiltinProviderDefinition | GenericProviderDefinition;
