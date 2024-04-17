import Authentik from 'next-auth/providers/authentik';

import { getServerConfig } from '@/config/server';

const { AUTHENTIK_CLIENT_ID, AUTHENTIK_CLIENT_SECRET, AUTHENTIK_ISSUER } = getServerConfig();

const provider = {
  id: 'authentik',
  provider: Authentik({
    // Specify auth scope, at least include 'openid email'
    // all scopes in Authentik ref: https://goauthentik.io/docs/providers/oauth2
    authorization: { params: { scope: 'openid email profile' } },
    clientId: AUTHENTIK_CLIENT_ID,
    clientSecret: AUTHENTIK_CLIENT_SECRET,
    issuer: AUTHENTIK_ISSUER,
  }),
};

export default provider;
