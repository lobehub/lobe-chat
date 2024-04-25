import OpenAI from 'openai';

import { checkAuth } from '@/app/api/auth';
import { getOpenAIAuthFromRequest } from '@/const/fetch';
import { ChatErrorType, ErrorType } from '@/types/fetch';

import { createErrorResponse } from '../../errorResponse';
import { createOpenai } from './createOpenai';

/**
 * createOpenAI Instance with Auth and azure openai support
 * if auth not pass ,just return error response
 */
export const createBizOpenAI = (req: Request): Response | OpenAI => {
  const { apiKey, accessCode, endpoint, oauthAuthorized } = getOpenAIAuthFromRequest(req);

  const result = checkAuth({ accessCode, apiKey, oauthAuthorized });

  if (!result.auth) {
    return createErrorResponse(result.error as ErrorType);
  }

  let openai: OpenAI;

  try {
    openai = createOpenai(apiKey, endpoint);
  } catch (error) {
    if ((error as Error).cause === ChatErrorType.NoOpenAIAPIKey) {
      return createErrorResponse(ChatErrorType.NoOpenAIAPIKey);
    }

    console.error(error); // log error to trace it
    return createErrorResponse(ChatErrorType.InternalServerError);
  }

  return openai;
};
