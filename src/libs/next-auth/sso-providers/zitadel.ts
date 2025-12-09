import Zitadel from 'next-auth/providers/zitadel';

const provider = {
  id: 'zitadel',
  provider: Zitadel({
    // Available scopes in ZITADEL: https://zitadel.com/docs/apis/openidoauth/scopes
    authorization: { params: { scope: 'openid email profile' } },
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
