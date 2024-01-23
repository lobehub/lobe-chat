import OpenAI from 'openai';

import { checkAuth } from '@/app/api/auth';
import { getServerConfig } from '@/config/server';
import { getOpenAIAuthFromRequest } from '@/const/fetch';
import { ChatErrorType, ErrorType } from '@/types/fetch';

import { generateApiToken } from './authToken';

/**
 * createZhipu Instance with Auth
 * if auth not pass ,just throw an error of {type:  }
 */
export const createZhipu = async (req: Request): Promise<OpenAI> => {
  const { accessCode, zhipuApiKey, zhipuProxyUrl } = getOpenAIAuthFromRequest(req);

  const result = checkAuth({ accessCode, apiKey: zhipuApiKey });

  if (!result.auth) {
    throw new TypeError(JSON.stringify({ type: result.error }));
  }

  const { ZHIPU_API_KEY, ZHIPU_PROXY_URL } = getServerConfig();

  const baseURL = zhipuProxyUrl || ZHIPU_PROXY_URL || 'https://open.bigmodel.cn/api/paas/v4';

  const apiKey = !zhipuApiKey ? ZHIPU_API_KEY : zhipuApiKey;

  let token: string;
  const noAPIToken = new TypeError(JSON.stringify({ type: ChatErrorType.NoAPIKey }));

  try {
    token = await generateApiToken(apiKey);
  } catch {
    throw noAPIToken;
  }

  if (!token) throw noAPIToken;

  try {
    return new OpenAI({
      apiKey: 'not-empty-for-placeholder',
      baseURL,
      defaultHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // if there is an error when creating openai instance, it is an internal server error at default
    let type: ErrorType = ChatErrorType.InternalServerError;

    if ((error as Error).cause === ChatErrorType.NoAPIKey) {
      type = ChatErrorType.NoAPIKey;
    } else {
      // if is the InternalServerError, log error to trace it
      console.error(error);
    }

    throw new TypeError(JSON.stringify({ type }));
  }
};
