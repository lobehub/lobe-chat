import { OIDCConfig, OIDCUserConfig } from '@auth/core/providers';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

interface LogtoProfile extends Record<string, any> {
  email: string;
  id: string;
  name?: string;
  picture: string;
  sub: string;
  username: string;
}

function LobeLogtoProvider(config: OIDCUserConfig<LogtoProfile>): OIDCConfig<LogtoProfile> {
  return {
    ...CommonProviderConfig,
    ...config,
    id: 'logto',
    name: 'Logto',
    profile(profile) {
      // You can customize the user profile mapping here
      return {
        email: profile.email,
        id: profile.sub,
        image: profile.picture,
        iss: profile.iss,
        
        name: profile.name ?? profile.username ?? profile.email,
        // Save issuer endpoint to the user profile
providerAccountId: profile.sub,
      };
    },
    type: 'oidc',
  };
}

async function refreshToken(iss: string, refresh_token: string) {
  const response = await fetch(`${iss}/token`, {
    body: new URLSearchParams({
      client_id: process.env.AUTH_LOGTO_ID!,
      client_secret: process.env.AUTH_LOGTO_SECRET!,
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

// ref: https://docs.logto.io/quick-starts/next-auth#get-refresh-token
const provider = {
  id: 'logto',
  provider: LobeLogtoProvider({
    authorization: {
      params: {
        prompt: 'consent',
        scope: 'openid offline_access profile email',
      },
    },
    // You can get the issuer value from the Logto Application Details page,
    // in the field "Issuer endpoint"
    clientId: authEnv.LOGTO_CLIENT_ID ?? process.env.AUTH_LOGTO_ID,
    clientSecret: authEnv.LOGTO_CLIENT_SECRET ?? process.env.AUTH_LOGTO_SECRET,
    issuer: authEnv.LOGTO_ISSUER ?? process.env.AUTH_LOGTO_ISSUER,
  }),
  refreshToken,
};

export default provider;
