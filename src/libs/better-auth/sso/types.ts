import type { GenericOAuthConfig } from 'better-auth/plugins';
import type { SocialProviders } from 'better-auth/social-providers';

export type SocialProviderDefinition = {
  aliases?: string[];
  build: () => SocialProviders[keyof SocialProviders] | undefined;
  id: keyof SocialProviders;
  type: 'social';
};

export type GenericProviderDefinition = {
  aliases?: string[];
  build: () => GenericOAuthConfig | undefined;
  id: string;
  type: 'generic';
};

export type BetterAuthProviderDefinition = SocialProviderDefinition | GenericProviderDefinition;
