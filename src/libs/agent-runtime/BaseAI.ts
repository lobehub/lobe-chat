import OpenAI from 'openai';

import { ChatModelCard } from '@/types/llm';

import { ChatCompetitionOptions, ChatStreamPayload } from './types';

export interface LobeRuntimeAI {
  baseURL?: string;
  chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions): Promise<Response>;

  models?(): Promise<any>;
}

export abstract class LobeOpenAICompatibleRuntime {
  abstract baseURL: string;
  abstract client: OpenAI;

  abstract chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions): Promise<Response>;

  abstract models(): Promise<ChatModelCard[]>;
}
