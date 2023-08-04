import { LOBE_CHAT_ACCESS_CODE, OPENAI_API_KEY_HEADER_KEY, OPENAI_END_POINT } from '@/const/fetch';
import { ErrorType } from '@/types/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

import { checkAuth } from './auth';
import { createErrorResponse } from './error';
import { createChatCompletion } from './openai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const payload = (await req.json()) as OpenAIStreamPayload;
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);
  const accessCode = req.headers.get(LOBE_CHAT_ACCESS_CODE);
  const endpoint = req.headers.get(OPENAI_END_POINT);

  const result = checkAuth({ accessCode, apiKey });

  if (!result.auth) {
    return createErrorResponse(result.error as ErrorType);
  }

  return createChatCompletion({ OPENAI_API_KEY: apiKey, endpoint, payload });
}
