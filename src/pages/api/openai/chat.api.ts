import OpenAI from 'openai';

import { getClientConfig } from '@/config/client';
import { getOpenAIAuthFromRequest } from '@/const/fetch';
import { ChatErrorType, ErrorType } from '@/types/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

import { checkAuth } from '../auth';
import { createChatCompletion } from '../createChatCompletion';
import { createErrorResponse } from '../error';
import { createAzureOpenai } from './createAzureOpenai';
import { createOpenai } from './createOpenai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const payload = (await req.json()) as OpenAIStreamPayload;

  const { apiKey, accessCode, endpoint, useAzure, apiVersion } = getOpenAIAuthFromRequest(req);

  const result = checkAuth({ accessCode, apiKey });

  if (!result.auth) {
    return createErrorResponse(result.error as ErrorType);
  }

  let openai: OpenAI;

  const { USE_AZURE_OPENAI } = getClientConfig();
  const useAzureOpenAI = useAzure || USE_AZURE_OPENAI;

  if (useAzureOpenAI) {
    if (!apiVersion) return createErrorResponse(ChatErrorType.BadRequest);

    // `https://test-001.openai.azure.com/openai/deployments/gpt-35-turbo`,
    const url = `${endpoint}/openai/deployments/${payload.model.replace('.', '')}`;

    openai = createAzureOpenai({
      apiVersion,
      endpoint: url,
      userApiKey: apiKey,
    });
  } else {
    openai = createOpenai(apiKey, endpoint);
  }

  return createChatCompletion({ openai, payload });
}
