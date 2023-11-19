import { OpenAIChatStreamPayload } from '@/types/openai/chat';

import { createBizOpenAI } from '../createBizOpenAI';
import { createChatCompletion } from './createChatCompletion';

const getPreferredRegion = () => {
  try {
    const cfg = getServerConfig();
    if (cfg.OPENAI_FUNCTION_REGIONS.length <= 0) {
      return 'auto';
    }

    return cfg.OPENAI_FUNCTION_REGIONS;
  } catch (error) {
    console.error('get server config failed, error:', error);
    return 'auto';
  }
};

export const runtime = 'edge';
export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIChatStreamPayload;

  const openaiOrErrResponse = createBizOpenAI(req, payload.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return createChatCompletion({ openai: openaiOrErrResponse, payload });
};
