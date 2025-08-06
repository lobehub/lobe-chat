import { ChatErrorType } from '@lobechat/types';
import { NextResponse } from 'next/server';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { ChatCompletionErrorPayload, ModelProvider } from '@/libs/model-runtime';
import { initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';
import { createErrorResponse } from '@/utils/errorResponse';

export const runtime = 'edge';

const noNeedAPIKey = (provider: string) => [ModelProvider.OpenRouter].includes(provider as any);

export const GET = checkAuth(async (req, { params, jwtPayload }) => {
  const { provider } = await params;

  try {
    const hasDefaultApiKey = jwtPayload.apiKey || 'dont-need-api-key-for-model-list';

    const agentRuntime = await initModelRuntimeWithUserPayload(provider, {
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
