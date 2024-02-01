import { getServerConfig } from '@/config/server';
import { ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { createError } from '@/libs/agent-runtime/utils/createError';

interface AuthConfig {
  accessCode?: string | null;
  apiKey?: string | null;
}

export const checkAuthWithProvider = (
  { apiKey, accessCode }: AuthConfig,
  error: ILobeAgentRuntimeErrorType,
) => {
  const { ACCESS_CODES } = getServerConfig();

  // if apiKey exist
  if (apiKey) {
    return { auth: true };
  }

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return { auth: true };

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    throw createError(error);
  }

  return { auth: true };
};
