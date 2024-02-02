import { getServerConfig } from '@/config/server';
import { AgentRuntimeError } from '@/libs/agent-runtime';
import { IChatErrorType } from '@/types/fetch';

interface AuthConfig {
  accessCode?: string | null;
  apiKey?: string | null;
}

export const checkAuthWithProvider = (
  { apiKey, accessCode }: AuthConfig,
  error: IChatErrorType,
) => {
  const { ACCESS_CODES } = getServerConfig();

  // if apiKey exist
  if (apiKey) return;

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return;

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    console.warn('tracked an invalid access code, 检查到输入的错误密码：', accessCode);
    throw AgentRuntimeError.createError(error);
  }
};
