import { getPreferredRegion } from '@/app/api/config';
import { createErrorResponse } from '@/app/api/errorResponse';
import { ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { ErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';

import AgentRuntime from './agentRuntime';

// due to the Chinese region does not support accessing Google / OpenAI
// we need to use proxy to access it
// refs: https://github.com/google/generative-ai-js/issues/29#issuecomment-1866246513
const proxyUrl = process.env.HTTP_PROXY_URL;
const useProxy = !!proxyUrl;

if (useProxy) {
  const { setGlobalDispatcher, ProxyAgent } = require('undici');

  setGlobalDispatcher(new ProxyAgent({ uri: proxyUrl }));
}
// undici only can be used in NodeJS.
// So when using proxy, switch to NodeJS runtime
export const runtime = useProxy ? 'nodejs' : 'edge';

export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request, { params }: { params: { provider: string } }) => {
  let agentRuntime: AgentRuntime;

  // ============  1. init chat model   ============ //

  try {
    agentRuntime = await AgentRuntime.initFromRequest(params.provider, req.clone());
  } catch (e) {
    // if catch the error, just return it
    const err = JSON.parse((e as Error).message) as { type: ErrorType };

    return createErrorResponse(err.type);
  }

  // ============  2. create chat completion   ============ //

  try {
    const payload = (await req.json()) as ChatStreamPayload;

    return await agentRuntime.chat(payload);
  } catch (e) {
    // let desensitizedEndpoint = runtimeModel.baseURL;
    //
    // // refs: https://github.com/lobehub/lobe-chat/issues/842
    // if (runtimeModel.baseURL && runtimeModel.baseURL !== 'https://api.openai.com/v1') {
    //   desensitizedEndpoint = desensitizeUrl(runtimeModel.baseURL);
    // }

    const { errorType, provider, error: errorContent, ...res } = e as ChatCompletionErrorPayload;

    // track the error at server side
    console.error(`Route: [${errorType}]`, errorContent);

    return createErrorResponse(errorType, {
      error: errorContent,
      provider,
      ...res,
    });
  }
};
