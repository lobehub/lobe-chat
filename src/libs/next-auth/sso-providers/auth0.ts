import Auth0 from 'next-auth/providers/auth0';
import UrlJoin from 'url-join';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

// ref: https://auth0.com/docs/secure/tokens/refresh-tokens/use-refresh-tokens#use-post-authentication
async function refreshToken(iss: string, refresh_token: string) {
  const response = await fetch(UrlJoin(iss, '/oauth/token'), {
    body: new URLSearchParams({
      client_id: process.env.AUTH_AUTH0_ID!,
      client_secret: process.env.AUTH_AUTH0_SECRET!,
      grant_type: 'refresh_token',
      refresh_token,
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  const tokensOrError = await response.json();

  if (!response.ok) throw tokensOrError;

  return tokensOrError as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
}

const provider = {
  id: 'auth0',
  provider: Auth0({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    // all scopes in Auth0 ref: https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
    authorization: { params: { scope: 'openid email profile offline_access' } },
    // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
    clientId: authEnv.AUTH0_CLIENT_ID ?? process.env.AUTH_AUTH0_ID,
    clientSecret: authEnv.AUTH0_CLIENT_SECRET ?? process.env.AUTH_AUTH0_SECRET,
    issuer: authEnv.AUTH0_ISSUER ?? process.env.AUTH_AUTH0_ISSUER,
    // Remove End
    profile(profile) {
      return {
        email: profile.email,
        id: profile.sub,
        image: profile.picture,
        name: profile.name,
        providerAccountId: profile.sub,
      };
    },
  }),
  refreshToken,
};

export default provider;
