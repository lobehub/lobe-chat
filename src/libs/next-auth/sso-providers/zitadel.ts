import Zitadel from 'next-auth/providers/zitadel';

import { authEnv } from '@/config/auth';

const provider = {
  id: 'zitadel',
  provider: Zitadel({
    // Available scopes in ZITADEL: https://zitadel.com/docs/apis/openidoauth/scopes
    authorization: { params: { scope: 'openid email profile' } },
    clientId: authEnv.ZITADEL_CLIENT_ID,
    clientSecret: authEnv.ZITADEL_CLIENT_SECRET,
    issuer: authEnv.ZITADEL_ISSUER,
    // TODO(NextAuth): map unique user id to `username` field
    // profile(profile) {
    //   return {
    //     username: profile.user_id,
    //     name: profile.name,
    //     email: profile.email,
    //     image: profile.picture,
    //   }
    // }
  }),
};

export default provider;
