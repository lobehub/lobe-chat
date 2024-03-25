import { ChatModelCard } from '@/types/llm';

import AnthropicProvider from './anthropic';
import BedrockProvider from './bedrock';
import GoogleProvider from './google';
import GroqProvider from './groq';
import MistralProvider from './mistral';
import MoonshotProvider from './moonshot';
import OllamaProvider from './ollama';
import OpenAIProvider from './openai';
import OpenRouterProvider from './openrouter';
import PerplexityProvider from './perplexity';
import ZeroOneProvider from './zeroone';
import ZhiPuProvider from './zhipu';

export const LOBE_DEFAULT_MODEL_LIST: ChatModelCard[] = [
  OpenAIProvider.chatModels,
  ZhiPuProvider.chatModels,
  BedrockProvider.chatModels,
  GoogleProvider.chatModels,
  GroqProvider.chatModels,
  MistralProvider.chatModels,
  MoonshotProvider.chatModels,
  OllamaProvider.chatModels,
  OpenRouterProvider.chatModels,
  PerplexityProvider.chatModels,
  AnthropicProvider.chatModels,
  ZeroOneProvider.chatModels,
].flat();

export { default as AnthropicProvider } from './anthropic';
export { default as BedrockProvider } from './bedrock';
export { default as GoogleProvider } from './google';
export { default as GroqProvider } from './groq';
export { default as MistralProvider } from './mistral';
export { default as MoonshotProvider } from './moonshot';
export { default as OllamaProvider } from './ollama';
export { default as OpenAIProvider } from './openai';
export { default as OpenRouterProvider } from './openrouter';
export { default as PerplexityProvider } from './perplexity';
export { default as ZeroOneProvider } from './zeroone';
export { default as ZhiPuProvider } from './zhipu';
