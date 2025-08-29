import { ModelProviderCard } from '@/types/llm';

// ref: https://api.cometapi.com/pricing
const CometAPI: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'gpt-5-chat-latest',
      enabled: true,
      id: 'gpt-5-chat-latest',
    },
    {
      displayName: 'chatgpt-4o-latest',
      enabled: true,
      id: 'chatgpt-4o-latest',
    },
    {
      displayName: 'gpt-5-mini',
      enabled: true,
      id: 'gpt-5-mini',
    },
    {
      displayName: 'gpt-5-nano',
      enabled: true,
      id: 'gpt-5-nano',
    },
    {
      displayName: 'gpt-5',
      enabled: true,
      id: 'gpt-5',
    },
    {
      displayName: 'gpt-4.1-mini',
      enabled: true,
      id: 'gpt-4.1-mini',
    },
    {
      displayName: 'gpt-4.1-nano',
      enabled: true,
      id: 'gpt-4.1-nano',
    },
    {
      displayName: 'gpt-4.1',
      enabled: true,
      id: 'gpt-4.1',
    },
    {
      displayName: 'gpt-4o-mini',
      enabled: true,
      id: 'gpt-4o-mini',
    },
    {
      displayName: 'o4-mini-2025-04-16',
      enabled: true,
      id: 'o4-mini-2025-04-16',
    },
    {
      displayName: 'o3-pro-2025-06-10',
      enabled: true,
      id: 'o3-pro-2025-06-10',
    },
    {
      displayName: 'claude-opus-4-1',
      enabled: true,
      id: 'claude-opus-4-1-20250805',
    },
    {
      displayName: 'claude-opus-4-1-20250805-thinking',
      enabled: true,
      id: 'claude-opus-4-1-20250805-thinking',
    },
    {
      displayName: 'claude-sonnet-4-20250514',
      enabled: true,
      id: 'claude-sonnet-4-20250514',
    },
    {
      displayName: 'claude-sonnet-4-20250514-thinking',
      enabled: true,
      id: 'claude-sonnet-4-20250514-thinking',
    },
    {
      displayName: 'claude-3-7-sonnet-latest',
      enabled: true,
      id: 'claude-3-7-sonnet-latest',
    },
    {
      displayName: 'claude-3-5-haiku-latest',
      enabled: true,
      id: 'claude-3-5-haiku-latest',
    },
    {
      displayName: 'gemini-2.5-pro',
      enabled: true,
      id: 'gemini-2.5-pro',
    },
    {
      displayName: 'gemini-2.5-flash',
      enabled: true,
      id: 'gemini-2.5-flash',
    },
    {
      displayName: 'gemini-2.5-flash-lite',
      enabled: true,
      id: 'gemini-2.5-flash-lite',
    },
    {
      displayName: 'gemini-2.0-flash',
      enabled: true,
      id: 'gemini-2.0-flash',
    },
    {
      displayName: 'grok-4-0709',
      enabled: true,
      id: 'grok-4-0709',
    },
    {
      displayName: 'grok-3',
      enabled: true,
      id: 'grok-3',
    },
    {
      displayName: 'grok-3-mini',
      enabled: true,
      id: 'grok-3-mini',
    },
    {
      displayName: 'grok-2-image-1212',
      enabled: true,
      id: 'grok-2-image-1212',
    },
    {
      displayName: 'deepseek-v3.1',
      enabled: true,
      id: 'deepseek-v3.1',
    },
    {
      displayName: 'deepseek-v3',
      enabled: true,
      id: 'deepseek-v3',
    },
    {
      displayName: 'deepseek-r1-0528',
      enabled: true,
      id: 'deepseek-r1-0528',
    },
    {
      displayName: 'deepseek-chat',
      enabled: true,
      id: 'deepseek-chat',
    },
    {
      displayName: 'deepseek-reasoner',
      enabled: true,
      id: 'deepseek-reasoner',
    },
  ],
  checkModel: 'gpt-4o-mini',
  description:
    'CometAPI 是一个提供多种前沿大模型接口的服务平台，支持 OpenAI、Anthropic、Google 及更多，适合多样化的开发和应用需求。用户可根据自身需求灵活选择最优的模型和价格，助力AI体验的提升。',
  enabled: true,
  id: 'cometapi',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://api.cometapi.com/v1/models',
  name: 'CometAPI',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.cometapi.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://cometapi.com',
};

export default CometAPI;
