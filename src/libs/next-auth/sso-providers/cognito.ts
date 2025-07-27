import Cognito from 'next-auth/providers/cognito';

export const cognito = Cognito({
  clientId: process.env.AUTH_COGNITO_ID,
  clientSecret: process.env.AUTH_COGNITO_SECRET,
  issuer: process.env.AUTH_COGNITO_ISSUER,
});
