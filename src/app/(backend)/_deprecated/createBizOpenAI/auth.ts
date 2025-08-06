import { ChatErrorType } from '@lobechat/types';

import { getAppConfig } from '@/envs/app';

interface AuthConfig {
  accessCode?: string | null;
  apiKey?: string | null;
  oauthAuthorized?: boolean;
}

export const checkAuth = ({ apiKey, accessCode, oauthAuthorized }: AuthConfig) => {
  // If authorized by oauth
  if (oauthAuthorized) {
    return { auth: true };
  }

  const { ACCESS_CODES } = getAppConfig();

  // if apiKey exist
  if (apiKey) {
    return { auth: true };
  }

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return { auth: true };

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    return { auth: false, error: ChatErrorType.InvalidAccessCode };
  }

  return { auth: true };
};
