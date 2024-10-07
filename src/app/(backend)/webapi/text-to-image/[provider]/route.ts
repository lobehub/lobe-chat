import { NextResponse } from 'next/server';

import { initAgentRuntimeWithUserPayload } from '@/app/(backend)/api/chat/agentRuntime';
import { createErrorResponse } from '@/app/(backend)/api/errorResponse';
import { checkAuth } from '@/app/(backend)/api/middleware/auth';
import { ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { TextToImagePayload } from '@/libs/agent-runtime/types';
import { ChatErrorType } from '@/types/fetch';

export const runtime = 'edge';

export const preferredRegion = [
  'arn1',
  'bom1',
  'cdg1',
  'cle1',
  'cpt1',
  'dub1',
  'fra1',
  'gru1',
  'hnd1',
  'iad1',
  'icn1',
  'kix1',
  'lhr1',
  'pdx1',
  'sfo1',
  'sin1',
  'syd1',
];

// return NextResponse.json(
//   {
//     body: {
//       endpoint: 'https://ai****ix.com/v1',
//       error: {
//         code: 'content_policy_violation',
//         message:
//           'Your request was rejected as a result of our safety system. Image descriptions generated from your prompt may contain text that is not allowed by our safety system. If you believe this was done in error, your request may succeed if retried, or by adjusting your prompt.',
//         param: null,
//         type: 'invalid_request_error',
//       },
//       provider: 'openai',
//     },
//     errorType: 'OpenAIBizError',
//   },
//   { status: 400 },
// );

export const POST = checkAuth(async (req: Request, { params, jwtPayload }) => {
  const { provider } = params;

  try {
    // ============  1. init chat model   ============ //
    const agentRuntime = await initAgentRuntimeWithUserPayload(provider, jwtPayload);

    // ============  2. create chat completion   ============ //

    const data = (await req.json()) as TextToImagePayload;

    const images = await agentRuntime.textToImage(data);

    return NextResponse.json(images);
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
