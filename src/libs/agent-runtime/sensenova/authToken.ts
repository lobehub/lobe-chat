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

  const encoder = new TextEncoder();

  const payload = {
    exp: Math.floor(Date.now() / 1000) + 60,
    iss: id,
    nbf: Math.floor(Date.now() / 1000) - 15,
  };

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(encoder.encode(secret));

  return jwt;
};
