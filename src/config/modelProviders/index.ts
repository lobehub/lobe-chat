import { ChatModelCard } from '@/types/llm';

import AnthropicProvider from './anthropic';
import BedrockProvider from './bedrock';
import GoogleProvider from './google';
import MistralProvider from './mistral';
import MoonshotProvider from './moonshot';
import OllamaProvider from './ollama';
import OpenAIProvider from './openai';
import PerplexityProvider from './perplexity';
import ZhiPuProvider from './zhipu';

export const LOBE_DEFAULT_MODEL_LIST: ChatModelCard[] = [
  OpenAIProvider.chatModels,
  ZhiPuProvider.chatModels,
  BedrockProvider.chatModels,
  GoogleProvider.chatModels,
  MistralProvider.chatModels,
  MoonshotProvider.chatModels,
  OllamaProvider.chatModels,
  PerplexityProvider.chatModels,
  AnthropicProvider.chatModels,
].flat();

export { default as AnthropicProvider } from './anthropic';
export { default as BedrockProvider } from './bedrock';
export { default as GoogleProvider } from './google';
export { default as MistralProvider } from './mistral';
export { default as MoonshotProvider } from './moonshot';
export { default as OllamaProvider } from './ollama';
export { default as OpenAIProvider } from './openai';
export { default as PerplexityProvider } from './perplexity';
export { default as ZhiPuProvider } from './zhipu';
