import { getServerConfig } from '@/config/server';
import { JWTPayload } from '@/const/fetch';
import { AgentRuntimeError } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

export const checkAuthWithProvider = ({ apiKey, accessCode }: JWTPayload) => {
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
