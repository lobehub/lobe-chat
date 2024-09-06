import { type AuthObject } from '@clerk/backend';
import { importJWK, jwtVerify } from 'jose';

import { getAppConfig } from '@/config/app';
import {
  JWTPayload,
  JWT_SECRET_KEY,
  NON_HTTP_PREFIX,
  enableClerk,
  enableNextAuth,
} from '@/const/auth';
import { AgentRuntimeError } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

export const getJWTPayload = async (token: string): Promise<JWTPayload> => {
  //如果是 HTTP 协议发起的请求，直接解析 token
  // 这是一个非常 hack 的解决方案，未来要找更好的解决方案来处理这个问题
  // refs: https://github.com/lobehub/lobe-chat/pull/1238
  if (token.startsWith(NON_HTTP_PREFIX)) {
    const jwtParts = token.split('.');

    const payload = jwtParts[1];

    return JSON.parse(atob(payload));
  }

  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest('SHA-256', encoder.encode(JWT_SECRET_KEY));

  const jwkSecretKey = await importJWK(
    { k: Buffer.from(secretKey).toString('base64'), kty: 'oct' },
    'HS256',
  );

  const { payload } = await jwtVerify(token, jwkSecretKey);

  return payload as JWTPayload;
};

interface CheckAuthParams {
  accessCode?: string;
  apiKey?: string;
  clerkAuth?: AuthObject;
  nextAuthAuthorized?: boolean;
}
/**
 * Check if the provided access code is valid, a user API key should be used or the OAuth 2 header is provided.
 *
 * @param {string} accessCode - The access code to check.
 * @param {string} apiKey - The user API key.
 * @param {boolean} oauthAuthorized - Whether the OAuth 2 header is provided.
 * @throws {AgentRuntimeError} If the access code is invalid and no user API key is provided.
 */
export const checkAuthMethod = ({
  apiKey,
  nextAuthAuthorized,
  accessCode,
  clerkAuth,
}: CheckAuthParams) => {
  // clerk auth handler
  if (enableClerk) {
    // if there is no userId, means the use is not login, just throw error
    if (!clerkAuth?.userId) throw AgentRuntimeError.createError(ChatErrorType.InvalidClerkUser);
    // if the user is login, just return
    else return;
  }

  // if next auth handler is provided
  if (enableNextAuth && nextAuthAuthorized) return;

  // if apiKey exist
  if (apiKey) return;

  const { ACCESS_CODES } = getAppConfig();

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return;

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    console.warn('tracked an invalid access code, 检查到输入的错误密码：', accessCode);
    throw AgentRuntimeError.createError(ChatErrorType.InvalidAccessCode);
  }
};
