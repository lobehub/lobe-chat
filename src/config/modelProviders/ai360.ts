import { ModelProviderCard } from '@/types/llm';

// ref: https://ai.360.cn/platform/docs/overview
const Ai360: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 8192,
      description:
        '360GPT2 Pro 是 360 公司推出的高级自然语言处理模型，具备卓越的文本生成和理解能力，尤其在生成与创作领域表现出色，能够处理复杂的语言转换和角色演绎任务。',
      displayName: '360GPT2 Pro',
      enabled: true,
      id: '360gpt2-pro',
      maxOutput: 7000,
      pricing: {
        currency: 'CNY',
        input: 5,
        output: 5,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '360GPT Pro 作为 360 AI 模型系列的重要成员，以高效的文本处理能力满足多样化的自然语言应用场景，支持长文本理解和多轮对话等功能。',
      displayName: '360GPT Pro',
      enabled: true,
      functionCall: true,
      id: '360gpt-pro',
      maxOutput: 7000,
      pricing: {
        currency: 'CNY',
        input: 5,
        output: 5,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '360GPT Turbo 提供强大的计算和对话能力，具备出色的语义理解和生成效率，是企业和开发者理想的智能助理解决方案。',
      displayName: '360GPT Turbo',
      enabled: true,
      id: '360gpt-turbo',
      maxOutput: 7000,
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 2,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '360GPT Turbo Responsibility 8K 强调语义安全和责任导向，专为对内容安全有高度要求的应用场景设计，确保用户体验的准确性与稳健性。',
      displayName: '360GPT Turbo Responsibility 8K',
      enabled: true,
      id: '360gpt-turbo-responsibility-8k',
      maxOutput: 2048,
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 2,
      },
    },
  ],
  checkModel: '360gpt-turbo',
  description:
    '360 AI 是 360 公司推出的 AI 模型和服务平台，提供多种先进的自然语言处理模型，包括 360GPT2 Pro、360GPT Pro、360GPT Turbo 和 360GPT Turbo Responsibility 8K。这些模型结合了大规模参数和多模态能力，广泛应用于文本生成、语义理解、对话系统与代码生成等领域。通过灵活的定价策略，360 AI 满足多样化用户需求，支持开发者集成，推动智能化应用的革新和发展。',
  disableBrowserRequest: true,
  id: 'ai360',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ai.360.cn/platform/docs/overview',
  name: '360 AI',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://ai.360.com',
};

export default Ai360;
