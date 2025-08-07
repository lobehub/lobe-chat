import { type AuthObject } from '@clerk/backend';
import { ChatErrorType } from '@lobechat/types';

import { enableClerk, enableNextAuth } from '@/const/auth';
import { getAppConfig } from '@/envs/app';
import { AgentRuntimeError } from '@/libs/model-runtime';

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
    if (!(clerkAuth as any)?.userId)
      throw AgentRuntimeError.createError(ChatErrorType.InvalidClerkUser);
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
