import { checkAuth } from '@/app/(backend)/middleware/auth';
import { ChatCompletionErrorPayload, PullModelParams } from '@/libs/agent-runtime';
import { initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import { ChatErrorType } from '@/types/fetch';
import { createErrorResponse } from '@/utils/errorResponse';

export const runtime = 'edge';

export const POST = checkAuth(async (req, { params, jwtPayload }) => {
  const { provider } = await params;

  try {
    const agentRuntime = await initAgentRuntimeWithUserPayload(provider, jwtPayload);

    const data = (await req.json()) as PullModelParams;

    const res = await agentRuntime.pullModel(data, { signal: req.signal });
    if (res) return res;

    throw new Error('No response');
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
