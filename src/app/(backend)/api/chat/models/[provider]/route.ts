import { NextResponse } from 'next/server';

import { createErrorResponse } from '@/app/(backend)/api/errorResponse';
import { ChatCompletionErrorPayload, ModelProvider } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

import { checkAuth } from '../../../middleware/auth';
import { initAgentRuntimeWithUserPayload } from '../../agentRuntime';

export const runtime = 'edge';

const noNeedAPIKey = (provider: string) =>
  [ModelProvider.OpenRouter, ModelProvider.TogetherAI].includes(provider as any);

export const GET = checkAuth(async (req, { params, jwtPayload }) => {
  const { provider } = params;

  try {
    const hasDefaultApiKey = jwtPayload.apiKey || 'dont-need-api-key-for-model-list';

    const agentRuntime = await initAgentRuntimeWithUserPayload(provider, {
      ...jwtPayload,
      apiKey: noNeedAPIKey(provider) ? hasDefaultApiKey : jwtPayload.apiKey,
    });

    const list = await agentRuntime.models();

    return NextResponse.json(list);
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;
    // track the error at server side
    console.error(`Route: [${provider}] ${errorType}:`, error);

    return createErrorResponse(errorType, { error, ...res, provider });
  }
});
