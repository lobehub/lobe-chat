import { ModelProviderCard } from '@/types/llm';

// ref: https://302.ai/pricing/
const Ai302: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 32_000,
      displayName: 'deepseek-chat',
      enabled: true,
      id: 'deepseek-chat',
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'gpt-4o',
      enabled: true,
      id: 'gpt-4o',
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'chatgpt-4o-latest',
      enabled: true,
      id: 'chatgpt-4o-latest',
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'llama3.3-70b',
      enabled: true,
      id: 'llama3.3-70b',
    },
    {
      contextWindowTokens: 64_000,
      displayName: 'deepseek-reasoner',
      enabled: true,
      id: 'deepseek-reasoner',
    },
    {
      contextWindowTokens: 1_000_000,
      displayName: 'gemini-2.0-flash',
      enabled: true,
      id: 'gemini-2.0-flash',
    },
    {
      contextWindowTokens: 200_000,
      displayName: 'claude-3-7-sonnet-20250219',
      enabled: true,
      id: 'claude-3-7-sonnet-20250219',
    },
    {
      contextWindowTokens: 200_000,
      displayName: 'claude-3-7-sonnet-latest',
      enabled: true,
      id: 'claude-3-7-sonnet-latest',
    },
    {
      contextWindowTokens: 131_072,
      displayName: 'grok-3-beta',
      enabled: true,
      id: 'grok-3-beta',
    },
    {
      contextWindowTokens: 131_072,
      displayName: 'grok-3-mini-beta',
      enabled: true,
      id: 'grok-3-mini-beta',
    },
    {
      contextWindowTokens: 1_000_000,
      displayName: 'gpt-4.1',
      enabled: true,
      id: 'gpt-4.1',
    },
    {
      contextWindowTokens: 200_000,
      displayName: 'o3',
      enabled: true,
      id: 'o3',
    },
    {
      contextWindowTokens: 200_000,
      displayName: 'o4-mini',
      enabled: true,
      id: 'o4-mini',
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'qwen3-235b-a22b',
      enabled: true,
      id: 'qwen3-235b-a22b',
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'qwen3-32b',
      enabled: true,
      id: 'qwen3-32b',
    },
    {
      contextWindowTokens: 1_000_000,
      displayName: 'gemini-2.5-pro-preview-05-06',
      enabled: true,
      id: 'gemini-2.5-pro-preview-05-06',
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'llama-4-maverick',
      enabled: true,
      id: 'llama-4-maverick',
    },
    {
      contextWindowTokens: 1_000_000,
      displayName: 'gemini-2.5-flash',
      enabled: true,
      id: 'gemini-2.5-flash',
    },
    {
      contextWindowTokens: 200_000,
      displayName: 'claude-sonnet-4-20250514',
      enabled: true,
      id: 'claude-sonnet-4-20250514',
    },
    {
      contextWindowTokens: 200_000,
      displayName: 'claude-opus-4-20250514',
      enabled: true,
      id: 'claude-opus-4-20250514',
    },
    {
      contextWindowTokens: 1_000_000,
      displayName: 'gemini-2.5-pro',
      enabled: true,
      id: 'gemini-2.5-pro',
    },
  ],
  checkModel: 'gpt-4o',
  description: '302.AI 是一个按需付费的 AI 应用平台，提供市面上最全的 AI API 和 AI 在线应用',
  id: 'ai302',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://302.ai/pricing/',
  name: '302.AI',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.302.ai/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://302.ai',
};

export default Ai302;
