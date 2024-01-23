import OpenAI from 'openai';

import { ErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';

export interface CompletionError {
  error: object;
  errorType: ErrorType;
  provider: ModelProvider;
}

export interface CreateChatCompletionOptions {
  chatModel: OpenAI;
  payload: ChatStreamPayload;
}

export enum ModelProvider {
  Anthropic = 'anthropic',
  Bedrock = 'bedrock',
  ChatGLM = 'chatglm',
  Google = 'google',
  Mistral = 'mistral',
  OpenAI = 'openai',
  Tongyi = 'tongyi',
  ZhiPu = 'zhipu'
}
