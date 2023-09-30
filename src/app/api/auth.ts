import { getServerConfig } from '@/config/server';
import { ChatErrorType } from '@/types/fetch';

interface AuthConfig {
  accessCode?: string | null;
  apiKey?: string | null;
}

export const checkAuth = ({ apiKey, accessCode }: AuthConfig) => {
  const { ACCESS_CODE } = getServerConfig();

  // 如果存在 apiKey
  if (apiKey) {
    return { auth: true };
  }

  // 如果不存在，则检查 accessCode
  if (!ACCESS_CODE) return { auth: true };

  if (accessCode !== ACCESS_CODE) {
    return { auth: false, error: ChatErrorType.InvalidAccessCode };
  }

  return { auth: true };
};
