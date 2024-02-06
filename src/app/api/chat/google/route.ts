import { createErrorResponse } from '@/app/api/errorResponse';
import { getServerConfig } from '@/config/server';
import { LOBE_CHAT_AUTH_HEADER, OAUTH_AUTHORIZED } from '@/const/auth';
import {
  AgentInitErrorPayload,
  AgentRuntimeError,
  ChatCompletionErrorPayload,
  ILobeAgentRuntimeErrorType,
  LobeGoogleAI,
} from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';

import { checkAuthMethod, getJWTPayload } from '../auth';

// due to the Chinese region does not support accessing Google
// we need to use proxy to access it
// refs: https://github.com/google/generative-ai-js/issues/29#issuecomment-1866246513
// if (process.env.HTTP_PROXY_URL) {
//   const { setGlobalDispatcher, ProxyAgent } = require('undici');
//
//   setGlobalDispatcher(new ProxyAgent({ uri: process.env.HTTP_PROXY_URL }));
// }
// undici only can be used in NodeJS
// export const runtime = 'nodejs';

export const runtime = 'edge';

export const preferredRegion = [
  'bom1',
  'cle1',
  'cpt1',
  'gru1',
  'hnd1',
  'iad1',
  'icn1',
  'kix1',
  'pdx1',
  'sfo1',
  'sin1',
  'syd1',
];

export const POST = async (req: Request) => {
  let agentRuntime: LobeGoogleAI;

  // ============  1. init chat model   ============ //

  try {
    // get Authorization from header
    const authorization = req.headers.get(LOBE_CHAT_AUTH_HEADER);
    const oauthAuthorized = !!req.headers.get(OAUTH_AUTHORIZED);

    if (!authorization) throw AgentRuntimeError.createError(ChatErrorType.Unauthorized);

    // check the Auth With payload
    const payload = await getJWTPayload(authorization);
    checkAuthMethod(payload.accessCode, payload.apiKey, oauthAuthorized);

    const { GOOGLE_API_KEY } = getServerConfig();
    const apiKey = payload?.apiKey || GOOGLE_API_KEY;

    agentRuntime = new LobeGoogleAI(apiKey);
  } catch (e) {
    // if catch the error, just return it
    const err = e as AgentInitErrorPayload;

    return createErrorResponse(err.errorType as ILobeAgentRuntimeErrorType, {
      error: err.error,
      provider: 'google',
    });
  }

  // ============  2. create chat completion   ============ //

  try {
    const payload = (await req.json()) as ChatStreamPayload;

    return await agentRuntime.chat(payload);
  } catch (e) {
    const { errorType, provider, error: errorContent, ...res } = e as ChatCompletionErrorPayload;

    // track the error at server side
    console.error(`Route: [${provider}] ${errorType}:`, errorContent);

    return createErrorResponse(errorType, { error: errorContent, provider, ...res });
  }
};
