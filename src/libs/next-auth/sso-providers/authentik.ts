import Authentik from 'next-auth/providers/authentik';

import { authEnv } from '@/config/auth';

const provider = {
  id: 'authentik',
  provider: Authentik({
    // Specify auth scope, at least include 'openid email'
    // all scopes in Authentik ref: https://goauthentik.io/docs/providers/oauth2
    authorization: { params: { scope: 'openid email profile' } },
    clientId: authEnv.AUTHENTIK_CLIENT_ID,
    clientSecret: authEnv.AUTHENTIK_CLIENT_SECRET,
    issuer: authEnv.AUTHENTIK_ISSUER,
  }),
};

export default provider;
