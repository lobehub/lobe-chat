import type { GenericOAuthConfig } from 'better-auth/plugins';

export const DEFAULT_OIDC_SCOPES = ['openid', 'email', 'profile'];

export const pickEnv = (...values: (string | undefined | null)[]) => {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
};

const createDiscoveryUrl = (issuer: string) => {
  const normalized = issuer.replace(/\/$/, '');
  return normalized.includes('/.well-known/')
    ? normalized
    : `${normalized}/.well-known/openid-configuration`;
};

type OIDCProviderInput = {
  clientId?: string;
  clientSecret?: string;
  issuer?: string;
  overrides?: Partial<GenericOAuthConfig>;
  pkce?: boolean;
  providerId: string;
  scopes?: string[];
};

const createOidcFallbackEndpoints = (issuer?: string) => {
  if (!issuer) return undefined;
  const normalizedIssuer = issuer.replace(/\/$/, '');

  return {
    // better-auth/better-auth#6042 – genericOAuth ignores discoveryUrl for sign-in,
    // so we provide fallback endpoints derived from the issuer.
    // Ref: https://github.com/better-auth/better-auth/issues/6042
    authorizationUrl: `${normalizedIssuer}/authorize`,
    tokenUrl: `${normalizedIssuer}/oauth/token`,
    userInfoUrl: `${normalizedIssuer}/userinfo`,
  } satisfies Partial<GenericOAuthConfig>;
};

export const buildOidcConfig = ({
  providerId,
  clientId,
  clientSecret,
  issuer,
  scopes = DEFAULT_OIDC_SCOPES,
  pkce = true,
  overrides,
}: OIDCProviderInput): GenericOAuthConfig => {
  const sanitizedIssuer = issuer?.trim();

  if (!clientId || !clientSecret || !sanitizedIssuer) {
    throw new Error(`[Better-Auth] ${providerId} OAuth enabled but missing credentials`);
  }

  const normalizedIssuer = sanitizedIssuer.replace(/\/$/, '');
  const discoveryUrl = createDiscoveryUrl(normalizedIssuer);
  const fallbackEndpoints = createOidcFallbackEndpoints(normalizedIssuer);

  return {
    clientId,
    clientSecret,
    discoveryUrl,
    pkce,
    providerId,
    scopes,
    ...fallbackEndpoints,
    ...overrides,
  } satisfies GenericOAuthConfig;
};
