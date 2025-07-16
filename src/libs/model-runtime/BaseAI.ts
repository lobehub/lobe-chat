import OpenAI from 'openai';

import { ChatModelCard } from '@/types/llm';

import {
  ChatMethodOptions,
  ChatStreamPayload,
  Embeddings,
  EmbeddingsOptions,
  EmbeddingsPayload,
  ModelRequestOptions,
  PullModelParams,
  TextToImagePayload,
  TextToSpeechOptions,
  TextToSpeechPayload,
} from './types';
import { CreateImagePayload, CreateImageResponse } from './types/image';

/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */
export interface LobeRuntimeAI {
  baseURL?: string;
  chat?(payload: ChatStreamPayload, options?: ChatMethodOptions): Promise<Response>;

  embeddings?(payload: EmbeddingsPayload, options?: EmbeddingsOptions): Promise<Embeddings[]>;

  models?(): Promise<any>;

  textToImage?: (payload: TextToImagePayload) => Promise<string[]>;
  createImage?: (payload: CreateImagePayload) => Promise<CreateImageResponse>;

  textToSpeech?: (
    payload: TextToSpeechPayload,
    options?: TextToSpeechOptions,
  ) => Promise<ArrayBuffer>;

  // 模型管理相关接口
  pullModel?(params: PullModelParams, options?: ModelRequestOptions): Promise<Response>;
}
/* eslint-enabled */

export abstract class LobeOpenAICompatibleRuntime {
  abstract baseURL: string;
  abstract client: OpenAI;

  abstract chat(payload: ChatStreamPayload, options?: ChatMethodOptions): Promise<Response>;
  abstract createImage(payload: CreateImagePayload): Promise<CreateImageResponse>;

  abstract models(): Promise<ChatModelCard[]>;

  abstract embeddings(
    payload: EmbeddingsPayload,
    options?: EmbeddingsOptions,
  ): Promise<Embeddings[]>;
}
