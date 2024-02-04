import { importJWK, jwtVerify } from 'jose';

import { getServerConfig } from '@/config/server';
import { JWTPayload, JWT_SECRET_KEY } from '@/const/auth';
import { AgentRuntimeError } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

export const getJWTPayload = async (token: string) => {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest('SHA-256', encoder.encode(JWT_SECRET_KEY));

  const jwkSecretKey = await importJWK(
    { k: Buffer.from(secretKey).toString('base64'), kty: 'oct' },
    'HS256',
  );

  const { payload } = await jwtVerify(token, jwkSecretKey);

  return payload as JWTPayload;
};

/**
 * Check if the provided access code is valid or if a user API key should be used.
 *
 * @param {string} accessCode - The access code to check.
 * @param {string} apiKey - The user API key.
 * @throws {AgentRuntimeError} If the access code is invalid and no user API key is provided.
 */
export const checkPasswordOrUseUserApiKey = (accessCode?: string, apiKey?: string) => {
  const { ACCESS_CODES } = getServerConfig();

  // if apiKey exist
  if (apiKey) return;

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return;

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    console.warn('tracked an invalid access code, 检查到输入的错误密码：', accessCode);
    throw AgentRuntimeError.createError(ChatErrorType.InvalidAccessCode);
  }
};
