import { getPreferredRegion } from '@/app/api/config';
import { createErrorResponse } from '@/app/api/errorResponse';
import {
  CompletionError,
  LobeOpenAI,
  LobeRuntimeAI,
  LobeZhipuAI,
  ModelProvider,
} from '@/libs/agent-runtime';
import { ChatErrorType, ErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';

import { desensitizeUrl } from './desensitizeUrl';

export const runtime = 'edge';

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
    if (runtimeModel.baseURL !== 'https://api.openai.com/v1') {
      desensitizedEndpoint = desensitizeUrl(runtimeModel.baseURL);
    }

    const { errorType, error: errorContent } = e as CompletionError;

    // track the error at server side
    console.error(errorContent);

    return createErrorResponse(errorType, { endpoint: desensitizedEndpoint, error: errorContent });
  }
};
