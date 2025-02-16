import { OIDCConfig, OIDCUserConfig } from '@auth/core/providers';
import UrlJoin from 'url-join';

import { CommonProviderConfig } from './sso.config';

interface CasdoorProfile extends Record<string, any> {
  avatar: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  id: string;
  lastName: string;
  name: string;
  owner: string;
  permanentAvatar: string;
}

function LobeCasdoorProvider(config: OIDCUserConfig<CasdoorProfile>): OIDCConfig<CasdoorProfile> {
  return {
    ...CommonProviderConfig,
    ...config,
    id: 'casdoor',
    name: 'Casdoor',
    profile(profile) {
      return {
        email: profile.email,
        emailVerified: profile.emailVerified ? new Date() : null,
        id: profile.id,
        image: profile.avatar,
        name: profile.displayName ?? profile.firstName ?? profile.lastName,
        providerAccountId: profile.id,
      };
    },
    type: 'oidc',
  };
}

// ref: https://casdoor.org/docs/how-to-connect/oauth/#refresh-token
async function refreshToken(iss: string, refresh_token: string) {
  const response = await fetch(UrlJoin(iss, '/api/login/oauth/access_token'), {
    body: new URLSearchParams({
      client_id: process.env.AUTH_CASDOOR_ID!,
      client_secret: process.env.AUTH_CASDOOR_SECRET!,
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
  id: 'casdoor',
  provider: LobeCasdoorProvider({
    authorization: {
      params: { scope: 'openid profile email' },
    },
    clientId: process.env.AUTH_CASDOOR_ID,
    clientSecret: process.env.AUTH_CASDOOR_SECRET,
    issuer: process.env.AUTH_CASDOOR_ISSUER,
  }),
  refreshToken,
};

export default provider;
