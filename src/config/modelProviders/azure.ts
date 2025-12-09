import { ModelProviderCard } from '@/types/llm';

// ref: https://learn.microsoft.com/azure/ai-services/openai/concepts/models
const Azure: ModelProviderCard = {
  chatModels: [],
  defaultShowBrowserRequest: true,
  description:
    'Azure 提供多种先进的AI模型，包括GPT-3.5和最新的GPT-4系列，支持多种数据类型和复杂任务，致力于安全、可靠和可持续的AI解决方案。',
  id: 'azure',
  modelsUrl: 'https://learn.microsoft.com/azure/ai-services/openai/concepts/models',
  name: 'Azure OpenAI',
  settings: {
    defaultShowBrowserRequest: true,
    sdkType: 'azure',
    showDeployName: true,
  },
  url: 'https://azure.microsoft.com',
};

export default Azure;
