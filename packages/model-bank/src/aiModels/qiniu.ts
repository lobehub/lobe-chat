import { AIChatModelCard } from '../types/aiModel';

// https://developer.qiniu.com/aitokenapi

const qiniuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      '推理速度大幅提升，位居开源模型之首，媲美顶尖闭源模型。采用负载均衡辅助策略和多标记预测训练，性能显著增强。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek R1 是 DeepSeek 团队发布的最新开源模型，具备非常强悍的推理性能，尤其在数学、编程和推理任务上达到了与 OpenAI 的 o1 模型相当的水平。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 204_800,
    description: '专为高效编码与 Agent 工作流而生',
    displayName: 'MiniMax M2',
    enabled: true,
    id: 'minimax/minimax-m2',
    maxOutput: 131_072,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-10-27',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: '美团开源的专为对话交互和智能体任务优化的非思维型基础模型，在工具调用和复杂多轮交互场景中表现突出',
    displayName: 'LongCat Flash Chat',
    enabled: true,
    id: 'meituan/longcat-flash-chat',
    maxOutput: 65536,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-09-01',
    settings: {
      extendParams: ['enableReasoning'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 200_000,
    description: '智谱最新旗舰模型 GLM-4.6，在高级编码、长文本处理、推理与智能体能力上全面超越前代。',
    displayName: 'GLM-4.6',
    enabled: true,
    id: 'z-ai/glm-4.6',
    maxOutput: 128_000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 7.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-09-30',
    settings: {
      extendParams: ['enableReasoning'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 2_000_000,
    description:
      '我们很高兴发布 Grok 4 Fast，这是我们在成本效益推理模型方面的最新进展。',
    displayName: 'Grok 4 Fast',
    enabled: true,
    id: 'x-ai/grok-4-fast',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 7.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-09-09',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 256_000,
    description:
      '我们很高兴推出 grok-code-fast-1，这是一款快速且经济高效的推理模型，在代理编码方面表现出色。',
    displayName: 'Grok Code Fast 1',
    id: 'x-ai/grok-code-fast-1',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.02, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-27',
    // settings: {
    // reasoning_effort is not supported by grok-code. Specifying reasoning_effort parameter will get an error response.
    // extendParams: ['reasoningEffort'],
    // },
    type: 'chat',
  },
];

export const allModels = [...qiniuChatModels];

export default allModels;
