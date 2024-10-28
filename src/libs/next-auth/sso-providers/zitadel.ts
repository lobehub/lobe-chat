import Zitadel from 'next-auth/providers/zitadel';

import { authEnv } from '@/config/auth';

const provider = {
  id: 'zitadel',
  provider: Zitadel({
    // Available scopes in ZITADEL: https://zitadel.com/docs/apis/openidoauth/scopes
    authorization: { params: { scope: 'openid email profile' } },
    // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
    clientId: authEnv.ZITADEL_CLIENT_ID ?? process.env.AUTH_ZITADEL_ID,
    clientSecret: authEnv.ZITADEL_CLIENT_SECRET ?? process.env.AUTH_ZITADEL_SECRET,
    issuer: authEnv.ZITADEL_ISSUER ?? process.env.AUTH_ZITADEL_ISSUER,
    // Remove end
    // TODO(NextAuth): map unique user id to `providerAccountId` field
    // profile(profile) {
    //   return {
    //     email: profile.email,
    //     image: profile.picture,
    //     name: profile.name,
    //     providerAccountId: profile.user_id,
    //     id: profile.user_id,
    //   };
    // },
  }),
};

export default provider;
