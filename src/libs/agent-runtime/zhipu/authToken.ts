import { SignJWT } from 'jose';

export const generateApiToken = async (apiKey?: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Invalid apiKey');
  }

  const [id, secret] = apiKey.split('.');
  if (!id || !secret) {
    throw new Error('Invalid apiKey');
  }

  const expSeconds = 60 * 60 * 24 * 30;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = nowSeconds + expSeconds;
  const jwtConstructor = new SignJWT({ api_key: id })
    .setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(nowSeconds);

  return jwtConstructor.sign(new TextEncoder().encode(secret));
};
