import OpenAI from 'openai';

import { checkAuth } from '@/app/api/auth';
import { getServerConfig } from '@/config/server';
import { getLobeAuthFromRequest } from '@/const/fetch';
import { ChatErrorType, ErrorType } from '@/types/fetch';

import { createAzureOpenai } from './createAzureOpenai';
import { createOpenai } from './createOpenai';

/**
 * createOpenAI Instance with Auth and azure openai support
 * if auth not pass ,just throw an error of {type:  }
 */
export const createBizOpenAI = (req: Request, model: string): OpenAI => {
  const { apiKey, accessCode, endpoint, useAzure, apiVersion } = getLobeAuthFromRequest(req);

  const result = checkAuth({ accessCode, apiKey });

  if (!result.auth) {
    throw new TypeError(JSON.stringify({ type: result.error }));
  }

  let openai: OpenAI;

  const { USE_AZURE_OPENAI } = getServerConfig();
  const useAzureOpenAI = useAzure || USE_AZURE_OPENAI;

  try {
    if (useAzureOpenAI) {
      openai = createAzureOpenai({ apiVersion, endpoint, model, userApiKey: apiKey });
    } else {
      openai = createOpenai(apiKey, endpoint);
    }
  } catch (error) {
    // if there is an error when creating openai instance, it is an internal server error at default
    let type: ErrorType = ChatErrorType.InternalServerError;

    if ((error as Error).cause === ChatErrorType.NoOpenAIAPIKey) {
      type = ChatErrorType.NoOpenAIAPIKey;
    } else {
      // if is the InternalServerError, log error to trace it
      console.error(error);
    }

    throw new TypeError(JSON.stringify({ type }));
  }

  return openai;
};
