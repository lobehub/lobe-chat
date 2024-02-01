import { getPreferredRegion } from '@/app/api/config';
import { createErrorResponse } from '@/app/api/errorResponse';
import { getServerConfig } from '@/config/server';
import {
  CompletionError,
  LobeBedrockAI,
  LobeOpenAI,
  LobeRuntimeAI,
  LobeZhipuAI,
  ModelProvider,
} from '@/libs/agent-runtime';
import LobeGoogleAI from '@/libs/agent-runtime/google';
import { ChatErrorType, ErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';

import { desensitizeUrl } from './desensitizeUrl';

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
  const payload = (await req.json()) as ChatStreamPayload;

  let runtimeModel: LobeRuntimeAI;

  // ============  1. init chat model   ============ //

  try {
    switch (params.provider) {
      default:
      case 'oneapi':
      case ModelProvider.OpenAI: {
        runtimeModel = new LobeOpenAI(req, payload.model);
        break;
      }

      case ModelProvider.ZhiPu: {
        runtimeModel = await LobeZhipuAI.fromRequest(req);
        break;
      }
      case ModelProvider.Google: {
        runtimeModel = new LobeGoogleAI(process.env.GOOGLE_API_KEY || '');
        break;
      }

      case ModelProvider.Bedrock: {
        const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID } = getServerConfig();
        if (!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY))
          throw new TypeError(JSON.stringify({ type: ChatErrorType.NoAPIKey }));

        runtimeModel = new LobeBedrockAI({
          accessKeyId: AWS_ACCESS_KEY_ID,
          accessKeySecret: AWS_SECRET_ACCESS_KEY,
        });
      }
    }
  } catch (e) {
    // if catch the error, just return it
    const err = JSON.parse((e as Error).message) as { type: ErrorType };

    return createErrorResponse(err.type);
  }

  if (!runtimeModel)
    return createErrorResponse(ChatErrorType.LobeChatBizError, {
      error: {
        message: 'chatModel is not initialized, please contact the lobehub team.',
        type: ChatErrorType.LobeChatBizError,
      },
    });

  // ============  2. create chat completion   ============ //

  try {
    return await runtimeModel.chat(payload);
  } catch (e) {
    let desensitizedEndpoint = runtimeModel.baseURL;

    // refs: https://github.com/lobehub/lobe-chat/issues/842
    if (runtimeModel.baseURL && runtimeModel.baseURL !== 'https://api.openai.com/v1') {
      desensitizedEndpoint = desensitizeUrl(runtimeModel.baseURL);
    }

    const { errorType, error: errorContent } = e as CompletionError;

    // track the error at server side
    console.error(errorContent);

    return createErrorResponse(errorType, { endpoint: desensitizedEndpoint, error: errorContent });
  }
};
