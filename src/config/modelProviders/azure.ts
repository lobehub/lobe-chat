import { ModelProviderCard } from '@/types/llm';

// ref: https://learn.microsoft.com/azure/ai-services/openai/concepts/models
const Azure: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 400_000,
      deploymentName: 'gpt-5-pro',
      description:
        'GPT-5 Pro 是 GPT-5 系列的高级版本，具备增强的推理能力。支持结构化输出、函数调用和文本/图像处理。',
      displayName: 'GPT-5 Pro',
      enabled: true,
      functionCall: true,
      id: 'gpt-5-pro',
      maxOutput: 128_000,
      vision: true,
    },
    {
      contextWindowTokens: 400_000,
      deploymentName: 'gpt-5-codex',
      description: 'GPT-5 Codex 专为编程任务优化，针对 Codex CLI 和 VS Code 扩展进行了优化。',
      displayName: 'GPT-5 Codex',
      enabled: true,
      functionCall: true,
      id: 'gpt-5-codex',
      maxOutput: 128_000,
    },
    {
      contextWindowTokens: 400_000,
      deploymentName: 'gpt-5',
      description:
        'GPT-5 是 OpenAI 最新的旗舰模型，具备卓越的推理能力。支持文本和图像输入，结构化输出和并行工具调用。',
      displayName: 'GPT-5',
      enabled: true,
      functionCall: true,
      id: 'gpt-5',
      maxOutput: 128_000,
      vision: true,
    },
    {
      contextWindowTokens: 400_000,
      deploymentName: 'gpt-5-mini',
      description:
        'GPT-5 Mini 提供与 GPT-5 相似的能力，但更加高效和经济。适合大规模部署和对成本敏感的应用场景。',
      displayName: 'GPT-5 Mini',
      enabled: true,
      functionCall: true,
      id: 'gpt-5-mini',
      maxOutput: 128_000,
      vision: true,
    },
    {
      contextWindowTokens: 400_000,
      deploymentName: 'gpt-5-nano',
      description:
        'GPT-5 Nano 是 GPT-5 系列中最小、最快的版本。在保持核心能力的同时，提供超低延迟和成本效益。',
      displayName: 'GPT-5 Nano',
      enabled: true,
      functionCall: true,
      id: 'gpt-5-nano',
      maxOutput: 128_000,
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      deploymentName: 'gpt-5-chat',
      description:
        'GPT-5 Chat 专为对话场景优化的预览版本。支持文本和图像输入，适用于聊天机器人应用。',
      displayName: 'GPT-5 Chat',
      functionCall: true,
      id: 'gpt-5-chat',
      maxOutput: 16_384,
      vision: true,
    },
    {
      contextWindowTokens: 16_385,
      deploymentName: 'gpt-35-turbo',
      description:
        'GPT 3.5 Turbo，OpenAI提供的高效模型，适用于聊天和文本生成任务，支持并行函数调用。',
      displayName: 'GPT 3.5 Turbo',
      enabled: true,
      functionCall: true,
      id: 'gpt-35-turbo',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 16_384,
      deploymentName: 'gpt-35-turbo-16k',
      description: 'GPT 3.5 Turbo 16k，高容量文本生成模型，适合复杂任务。',
      displayName: 'GPT 3.5 Turbo',
      functionCall: true,
      id: 'gpt-35-turbo-16k',
    },
    {
      contextWindowTokens: 128_000,
      deploymentName: 'gpt-4-turbo',
      description: 'GPT 4 Turbo，多模态模型，提供杰出的语言理解和生成能力，同时支持图像输入。',
      displayName: 'GPT 4 Turbo',
      enabled: true,
      functionCall: true,
      id: 'gpt-4',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      deploymentName: 'gpt-4o-mini',
      description: 'GPT-4o Mini，小型高效模型，具备与GPT-4o相似的卓越性能。',
      displayName: 'GPT 4o Mini',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-mini',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      deploymentName: 'gpt-4o',
      description: 'GPT-4o 是最新的多模态模型，结合高级文本和图像处理能力。',
      displayName: 'GPT 4o',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o',
      vision: true,
    },
  ],
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
