import { ModelProviderCard } from '@/types/llm';

// ref: https://ai.360.cn/platform/docs/overview
const Ai360: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 8000,
      description:
        '360gpt2-o1 使用树搜索构建思维链，并引入了反思机制，使用强化学习训练，模型具备自我反思与纠错的能力。',
      displayName: '360GPT2 o1',
      enabled: true,
      id: '360gpt2-o1',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 50,
      },
    },
    {
      contextWindowTokens: 8000,
      description:
        '360智脑系列效果最好的主力千亿级大模型，广泛适用于各领域复杂任务场景。',
      displayName: '360GPT2 Pro',
      enabled: true,
      id: '360gpt2-pro',
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 5,
      },
    },
    {
      contextWindowTokens: 8000,
      description:
        '360智脑系列效果最好的主力千亿级大模型，广泛适用于各领域复杂任务场景。',
      displayName: '360GPT Pro',
      enabled: true,
      functionCall: true,
      id: '360gpt-pro',
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 5,
      },
    },
    {
      contextWindowTokens: 7000,
      description:
        '兼顾性能和效果的百亿级大模型，适合对性能/成本要求较高 的场景。',
      displayName: '360GPT Turbo',
      enabled: true,
      id: '360gpt-turbo',
      pricing: {
        currency: 'CNY',
        input: 1,
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
