import { AIChatModelCard } from '@/types/aiModel';

const azureChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    displayName: 'DeepSeek R1',
    id: 'DeepSeek-R1',
    pricing: {
      input: 1.35,
      output: 5.4,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    displayName: 'DeepSeek V3',
    id: 'DeepSeek-V3',
    pricing: {
      input: 1.14,
      output: 4.56,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 是我们用于复杂任务的旗舰模型。它非常适合跨领域解决问题。',
    displayName: 'GPT-4.1',
    enabled: true,
    id: 'gpt-4.1',
    maxOutput: 32_768,
    pricing: {
      cachedInput: 0.5,
      input: 2,
      output: 8,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
    displayName: 'GPT-4.1 mini',
    enabled: true,
    id: 'gpt-4.1-mini',
    maxOutput: 32_768,
    pricing: {
      cachedInput: 0.1,
      input: 0.4,
      output: 1.6,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
    displayName: 'GPT-4.1 nano',
    enabled: true,
    id: 'gpt-4.1-nano',
    maxOutput: 32_768,
    pricing: {
      cachedInput: 0.025,
      input: 0.1,
      output: 0.4,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4.5-preview 是最新的通用模型，具有深厚的世界知识和对用户意图的更好理解，擅长创意任务和代理规划。该模型的知识截止2023年10月。',
    displayName: 'GPT 4.5 Preview',
    id: 'gpt-4.5-preview',
    pricing: {
      cachedInput: 37.5,
      input: 75,
      output: 150,
    },
    releasedAt: '2025-02-27',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3-mini 是我们最新的小型推理模型，在与 o1-mini 相同的成本和延迟目标下提供高智能。',
    displayName: 'o3-mini',
    id: 'o3-mini',
    pricing: {
      cachedInput: 0.55,
      input: 1.1,
      output: 4.4,
    },
    releasedAt: '2025-01-31',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-mini',
    id: 'o1-mini',
    pricing: {
      cachedInput: 0.55,
      input: 1.1,
      output: 4.4,
    },
    releasedAt: '2024-09-12',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
    displayName: 'o1',
    id: 'o1',
    pricing: {
      cachedInput: 7.5,
      input: 15,
      output: 60,
    },
    releasedAt: '2024-12-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o',
    id: 'gpt-4o',
    maxOutput: 4096,
    pricing: {
      cachedInput: 1.25,
      input: 2.5,
      output: 10,
    },
    releasedAt: '2024-05-13',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description: 'GPT-4o Mini，小型高效模型，具备与GPT-4o相似的卓越性能。',
    displayName: 'GPT 4o Mini',
    id: 'gpt-4o-mini',
    maxOutput: 16_384,
    pricing: {
      cachedInput: 0.075,
      input: 0.15,
      output: 0.6,
    },
    type: 'chat',
  },
];

export const allModels = [...azureChatModels];

export default allModels;
