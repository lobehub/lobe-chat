import OpenAI from 'openai';

import { ChatModelCard } from '@/types/llm';

import {
  ChatCompetitionOptions,
  ChatStreamPayload,
  EmbeddingItem,
  EmbeddingsOptions,
  EmbeddingsPayload,
  TextToImagePayload,
  TextToSpeechOptions,
  TextToSpeechPayload,
} from './types';

export interface LobeRuntimeAI {
  baseURL?: string;
  chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions): Promise<Response>;

  embeddings?(payload: EmbeddingsPayload, options?: EmbeddingsOptions): Promise<EmbeddingItem[]>;

  models?(): Promise<any>;

  textToImage?: (payload: TextToImagePayload) => Promise<string[]>;

  textToSpeech?: (
    payload: TextToSpeechPayload,
    options?: TextToSpeechOptions,
  ) => Promise<ArrayBuffer>;
}

export abstract class LobeOpenAICompatibleRuntime {
  abstract baseURL: string;
  abstract client: OpenAI;

  abstract chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions): Promise<Response>;

  abstract models(): Promise<ChatModelCard[]>;

  abstract embeddings(
    payload: EmbeddingsPayload,
    options?: EmbeddingsOptions,
  ): Promise<EmbeddingItem[]>;
}
