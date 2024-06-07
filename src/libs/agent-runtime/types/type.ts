import OpenAI from 'openai';

import { ILobeAgentRuntimeErrorType } from '../error';
import { ChatStreamPayload } from './chat';

export interface AgentInitErrorPayload {
  error: object;
  errorType: string | number;
}

export interface ChatCompletionErrorPayload {
  [key: string]: any;
  endpoint?: string;
  error: object;
  errorType: ILobeAgentRuntimeErrorType;
  provider: ModelProvider;
}

export interface CreateChatCompletionOptions {
  chatModel: OpenAI;
  payload: ChatStreamPayload;
}

export enum ModelProvider {
  Anthropic = 'anthropic',
  Azure = 'azure',
  Bedrock = 'bedrock',
  DeepSeek = 'deepseek',
  Google = 'google',
  Groq = 'groq',
  Minimax = 'minimax',
  Mistral = 'mistral',
  Moonshot = 'moonshot',
  Ollama = 'ollama',
  OpenAI = 'openai',
  OpenRouter = 'openrouter',
  Perplexity = 'perplexity',
  Qwen = 'qwen',
  TogetherAI = 'togetherai',
  ZeroOne = 'zeroone',
  ZhiPu = 'zhipu',
}

export type ModelProviderKey = Lowercase<keyof typeof ModelProvider>;
