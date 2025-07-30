import { ModelProviderCard } from '@/types/llm';

// ref: https://learn.microsoft.com/azure/ai-services/openai/concepts/models
const Azure: ModelProviderCard = {
  chatModels: [],
  description:
    'Azure 提供多种先进的AI模型，包括GPT-3.5和最新的GPT-4系列，支持多种数据类型和复杂任务，致力于安全、可靠和可持续的AI解决方案。',
  id: 'azureai',
  modelsUrl: 'https://ai.azure.com/explore/models',
  name: 'Azure AI',
  settings: {
    defaultShowBrowserRequest: true,
    sdkType: 'azureai',
    showDeployName: true,
  },
  url: 'https://ai.azure.com',
};

export default Azure;
