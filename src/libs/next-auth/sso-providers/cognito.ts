import Cognito from 'next-auth/providers/cognito';

import { authEnv } from '@/config/auth';

const provider = {
  id: 'cognito',
  provider: Cognito({
    clientId: authEnv.COGNITO_CLIENT_ID ?? process.env.AUTH_COGNITO_ID,
    clientSecret: authEnv.COGNITO_CLIENT_SECRET ?? process.env.AUTH_COGNITO_SECRET,
    issuer: authEnv.COGNITO_ISSUER ?? process.env.AUTH_COGNITO_ISSUER,
  }),
};


export default provider;
