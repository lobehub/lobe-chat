import { AIChatModelCard, Pricing } from '../types/aiModel';

const buildUSDPrice = (input: number, output: number, cache?: number): Pricing => ({
  currency: 'USD',
  units: [
    ...(cache !== undefined
      ? [
          {
            name: 'textInput_cacheRead' as const,
            rate: cache,
            strategy: 'fixed' as const,
            unit: 'millionTokens' as const,
          },
        ]
      : []),
    {
      name: 'textInput',
      rate: input,
      strategy: 'fixed',
      unit: 'millionTokens',
    },
    {
      name: 'textOutput',
      rate: output,
      strategy: 'fixed',
      unit: 'millionTokens',
    },
  ],
});

const burncloudChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 是 BurnCloud 提供的旗舰版本，具备 1M 级上下文与多模态感知，适合高复杂度的企业工作流。',
    displayName: 'GPT-4.1',
    enabled: true,
    id: 'gpt-4.1',
    maxOutput: 32_768,
    pricing: buildUSDPrice(2, 8, 0.5),
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 (2025-04-14) 是最新稳定分支，针对长文档与工具使用进行了额外优化。',
    displayName: 'GPT-4.1 (2025-04-14)',
    id: 'gpt-4.1-2025-04-14',
    maxOutput: 32_768,
    pricing: buildUSDPrice(2, 8, 0.5),
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 在成本和吞吐之间取得平衡，适合客服、Agent Orchestration 等需要 1M 上下文的批量场景。',
    displayName: 'GPT-4.1 mini',
    id: 'gpt-4.1-mini',
    maxOutput: 32_768,
    pricing: buildUSDPrice(0.4, 1.6, 0.1),
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 mini (2025-04-14) 版本提供最新推理补丁，改善了结构化输出表现。',
    displayName: 'GPT-4.1 mini (2025-04-14)',
    id: 'gpt-4.1-mini-2025-04-14',
    maxOutput: 32_768,
    pricing: buildUSDPrice(0.4, 1.6, 0.1),
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 nano 针对极低延迟与批量任务设计，仍保留图像理解能力，适合边缘响应与轻代理。',
    displayName: 'GPT-4.1 nano',
    id: 'gpt-4.1-nano',
    maxOutput: 32_768,
    pricing: buildUSDPrice(0.1, 0.4, 0.025),
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 nano (2025-04-14) 版本进一步降低延迟，适合集成到移动端或 IoT 设备。',
    displayName: 'GPT-4.1 nano (2025-04-14)',
    id: 'gpt-4.1-nano-2025-04-14',
    maxOutput: 32_768,
    pricing: buildUSDPrice(0.1, 0.4, 0.025),
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o 是 BurnCloud Omni 系列的旗舰模型，主打低延迟的语音 / 视觉 / 文本融合对话体验。',
    displayName: 'GPT-4o',
    enabled: true,
    id: 'gpt-4o',
    maxOutput: 16_384,
    pricing: buildUSDPrice(2.5, 10),
    releasedAt: '2024-05-13',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini 面向性价比与响应速度做了裁剪，依旧兼容多模态输入，适合在高并发或成本敏感的工作流中替换 3.5 系列。',
    displayName: 'GPT-4o mini',
    id: 'gpt-4o-mini',
    maxOutput: 16_384,
    pricing: buildUSDPrice(0.15, 0.6, 0.075),
    releasedAt: '2024-07-18',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    description:
      'DeepSeek-R1（deepseek-reasoner）在给出最终回答前会输出可见的推理链，适合需要透明思考过程的算数、逻辑与代码任务。',
    displayName: 'DeepSeek R1',
    id: 'deepseek-reasoner',
    pricing: buildUSDPrice(0.1104, 1.7632),
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    description:
      'DeepSeek-V3 是面向多语言和代理编排的旗舰模型，在 BurnCloud 中可与 R1 构成推理 + 对话组合。',
    displayName: 'DeepSeek V3',
    id: 'deepseek-chat',
    pricing: buildUSDPrice(0.0552, 0.8816),
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet v2 平衡推理与实时响应，支持图像输入与更快的工具调用，适合企业生产工作流。',
    displayName: 'Claude 3.5 Sonnet v2',
    id: 'claude-3-5-sonnet-v2',
    pricing: buildUSDPrice(2.4, 12),
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    description: 'Grok-3 是 xAI 最新旗舰模型，覆盖数学、代码与视觉推理，并支持 Agents 工具调用。',
    displayName: 'Grok 3',
    id: 'grok-3',
    pricing: buildUSDPrice(3, 15),
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    description:
      'Grok-3 Fast 在 Grok-3 的基础上进一步压缩延迟，以更高的吞吐量覆盖日常客服或生成任务。',
    displayName: 'Grok 3 Fast',
    id: 'grok-3-fast',
    pricing: buildUSDPrice(5, 25),
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description: 'GPT-4o (2024-05-13) 快照更注重准确性，可用于受监管场景的结果可追溯。',
    displayName: 'GPT-4o (2024-05-13)',
    id: 'gpt-4o-2024-05-13',
    maxOutput: 16_384,
    pricing: buildUSDPrice(2.5, 10),
    releasedAt: '2024-05-13',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o (2024-08-06) 在保持多模态体验的同时进一步压缩 Token 成本，适合中高并发场景。',
    displayName: 'GPT-4o (2024-08-06)',
    id: 'gpt-4o-2024-08-06',
    maxOutput: 16_384,
    pricing: buildUSDPrice(2.5, 10),
    releasedAt: '2024-08-06',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description: 'GPT-4o (2024-11-20) 是当前 BurnCloud 定价表中的默认 4o 版本，兼顾成本与延迟。',
    displayName: 'GPT-4o (2024-11-20)',
    id: 'gpt-4o-2024-11-20',
    maxOutput: 16_384,
    pricing: buildUSDPrice(2.5, 10),
    releasedAt: '2024-11-20',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
];

export const allModels = [...burncloudChatModels];

export default allModels;
