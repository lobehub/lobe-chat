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
        name: profile.name ?? profile.username ?? profile.email,
        providerAccountId: profile.sub,
      };
    },
    type: 'oidc',
  };
}

const provider = {
  id: 'logto',
  provider: LobeLogtoProvider({
    authorization: {
      params: { scope: 'openid offline_access profile email' },
    },
    // You can get the issuer value from the Logto Application Details page,
    // in the field "Issuer endpoint"
    clientId: authEnv.LOGTO_CLIENT_ID ?? process.env.AUTH_LOGTO_ID,
    clientSecret: authEnv.LOGTO_CLIENT_SECRET ?? process.env.AUTH_LOGTO_SECRET,
    issuer: authEnv.LOGTO_ISSUER ?? process.env.AUTH_LOGTO_ISSUER,
  }),
};

export default provider;
