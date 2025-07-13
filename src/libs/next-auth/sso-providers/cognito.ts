import Cognito from 'next-auth/providers/cognito';

const provider = {
  id: 'cognito',
  provider: Cognito({
    clientId: process.env.AUTH_COGNITO_ID,
    clientSecret: process.env.AUTH_COGNITO_SECRET,
    issuer: process.env.AUTH_COGNITO_ISSUER,
  }),
};

export default provider;
