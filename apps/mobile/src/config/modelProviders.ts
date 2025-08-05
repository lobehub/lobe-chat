// RN 端简化版本的模型提供商配置
// 基于 Web 端 src/config/modelProviders/index.ts

export interface ModelProvider {
  chatModels?: string[];
  enabled: boolean;
  id: string;
  imageModels?: string[];
  name: string;
  sort?: number;
  source: 'builtin' | 'custom';
}

// 简化的默认模型提供商列表
export const DEFAULT_MODEL_PROVIDER_LIST: ModelProvider[] = [
  {
    chatModels: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    enabled: true,
    id: 'openai',
    imageModels: ['dall-e-3', 'dall-e-2'],
    name: 'OpenAI',
    sort: 1,
    source: 'builtin',
  },
  {
    chatModels: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    enabled: true,
    id: 'anthropic',
    name: 'Anthropic',
    sort: 2,
    source: 'builtin',
  },
  {
    chatModels: ['gemini-pro', 'gemini-pro-vision'],
    enabled: true,
    id: 'google',
    name: 'Google',
    sort: 3,
    source: 'builtin',
  },
  {
    chatModels: [],
    enabled: false,
    id: 'azure',
    name: 'Azure OpenAI',
    sort: 4,
    source: 'builtin',
  },
  {
    chatModels: ['llama2', 'codellama'],
    enabled: false,
    id: 'ollama',
    name: 'Ollama',
    sort: 5,
    source: 'builtin',
  },
];

// 用于判断提供商是否禁用浏览器请求
export const isProviderDisableBrowserRequest = (): boolean => {
  // 简化实现：RN 端默认都允许浏览器请求
  return false;
};
