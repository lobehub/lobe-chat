import { StreamingTextResponse } from 'ai';

import { ChatStreamPayload } from '@/types/openai/chat';

export interface LobeRuntimeAI {
  baseURL?: string;

  chat(payload: ChatStreamPayload): Promise<StreamingTextResponse>;
}
