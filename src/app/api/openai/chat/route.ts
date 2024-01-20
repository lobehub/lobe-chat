import { ChatOpenAI } from '@langchain/openai';

import { desensitizeUrl } from '@/app/api/openai/chat/desensitizeUrl';
import { getOpenAIAuthFromRequest } from '@/const/fetch';
import { OpenAIChatStreamPayload } from '@/types/openai/chat';

import { getPreferredRegion } from '../../config';
import { createBizOpenAI } from '../createBizOpenAI';
import { createChatCompletion } from './createChatCompletionLang';

export const runtime = 'edge';
export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIChatStreamPayload;

  const openaiOrErrResponse = createBizOpenAI(req, payload.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  const { messages, tools, ...params } = payload;

  const { endpoint } = getOpenAIAuthFromRequest(req);

  const baseURL = endpoint || process.env.OPENAI_PROXY_URL;

  const model = new ChatOpenAI({
    configuration: { baseURL },
    maxRetries: 0,
    modelKwargs: params,
    streaming: true,
  }).bind({ tools });

  const desensitizedEndpoint = desensitizeUrl(baseURL);

  return createChatCompletion(model, messages, desensitizedEndpoint);
};
