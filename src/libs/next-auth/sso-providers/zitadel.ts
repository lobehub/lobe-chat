import Zitadel from 'next-auth/providers/zitadel';

import { getServerConfig } from '@/config/server';

const { ZITADEL_CLIENT_ID, ZITADEL_CLIENT_SECRET, ZITADEL_ISSUER } = getServerConfig();

const provider = {
  id: 'zitadel',
  provider: Zitadel({
    // Available scopes in ZITADEL: https://zitadel.com/docs/apis/openidoauth/scopes
    authorization: { params: { scope: 'openid email profile' } },
    clientId: ZITADEL_CLIENT_ID,
    clientSecret: ZITADEL_CLIENT_SECRET,
    issuer: ZITADEL_ISSUER,
  }),
};

export default provider;
