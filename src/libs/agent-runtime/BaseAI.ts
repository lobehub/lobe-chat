import { StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

import { ChatCompetitionOptions, ChatStreamPayload } from './types';

export interface LobeRuntimeAI {
  baseURL?: string;
  chat(
    payload: ChatStreamPayload,
    options?: ChatCompetitionOptions,
  ): Promise<StreamingTextResponse>;
}

export abstract class LobeOpenAICompatibleRuntime {
  abstract chat(
    payload: ChatStreamPayload,
    options?: ChatCompetitionOptions,
  ): Promise<StreamingTextResponse>;

  abstract client: OpenAI;

  abstract baseURL: string;
}
