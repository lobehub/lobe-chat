import { SignJWT } from 'jose';

// https://console.sensecore.cn/help/docs/model-as-a-service/nova/overview/Authorization
export const generateApiToken = async (apiKey?: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Invalid apiKey');
  }

  const [id, secret] = apiKey.split(':');
  if (!id || !secret) {
    throw new Error('Invalid apiKey');
  }

  const currentTime = Math.floor(Date.now() / 1000);

  const payload = {
    exp: currentTime + 1800,
    iss: id,
    nbf: currentTime - 5,
  };

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(new TextEncoder().encode(secret));

  return jwt;
};
