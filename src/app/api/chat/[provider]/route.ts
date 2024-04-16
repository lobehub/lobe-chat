import { getPreferredRegion } from '@/app/api/config';
import { createErrorResponse } from '@/app/api/errorResponse';
import { ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';
import { getTracePayload } from '@/utils/trace';

import AgentRuntime from '../agentRuntime';
import { checkAuth } from '../auth';

export const runtime = 'edge';

export const preferredRegion = getPreferredRegion();

export const POST = checkAuth(async (req: Request, { params, jwtPayload }) => {
  const { provider } = params;

  try {
    // ============  1. init chat model   ============ //
    const agentRuntime = await AgentRuntime.initializeWithUserPayload(provider, jwtPayload);

    // ============  2. create chat completion   ============ //

    const data = (await req.json()) as ChatStreamPayload;

    const tracePayload = getTracePayload(req);

    return await agentRuntime.chat(data, {
      enableTrace: tracePayload?.enabled,
      provider,
      trace: tracePayload,
    });
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
