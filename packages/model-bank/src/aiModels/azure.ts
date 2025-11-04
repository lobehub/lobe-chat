import { AIChatModelCard, AIImageModelCard } from '../types/aiModel';

const azureChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-5-pro',
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5 Pro 是 GPT-5 系列的高级版本，具备增强的推理能力。支持结构化输出、函数调用和文本/图像处理，适用于复杂的专业任务。',
    displayName: 'GPT-5 Pro',
    enabled: true,
    id: 'gpt-5-pro',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 120, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-10-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
    },
    config: {
      deploymentName: 'gpt-5-codex',
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5 Codex 专为编程任务优化，针对 Codex CLI 和 VS Code 扩展进行了优化。支持结构化输出和函数调用，适用于代码生成和分析。',
    displayName: 'GPT-5 Codex',
    enabled: true,
    id: 'gpt-5-codex',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.125, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-09-11',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-5',
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5 是 OpenAI 最新的旗舰模型，具备卓越的推理能力。支持文本和图像输入，结构化输出和并行工具调用，适用于需要深度理解和分析的复杂任务。',
    displayName: 'GPT-5',
    enabled: true,
    id: 'gpt-5',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.125, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-5-mini',
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5 Mini 提供与 GPT-5 相似的能力，但更加高效和经济。支持推理、函数调用和视觉功能，适合大规模部署和对成本敏感的应用场景。',
    displayName: 'GPT-5 Mini',
    enabled: true,
    id: 'gpt-5-mini',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.025, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-5-nano',
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5 Nano 是 GPT-5 系列中最小、最快的版本。在保持核心能力的同时，提供超低延迟和成本效益，适合边缘计算和实时应用。',
    displayName: 'GPT-5 Nano',
    enabled: true,
    id: 'gpt-5-nano',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.05, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.005, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    config: {
      deploymentName: 'gpt-5-chat',
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-5 Chat 专为对话场景优化的预览版本。支持文本和图像输入，仅输出文本，适用于聊天机器人和对话式AI应用。',
    displayName: 'GPT-5 Chat',
    id: 'gpt-5-chat',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.125, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    config: {
      deploymentName: 'o3',
    },
    contextWindowTokens: 200_000,
    description:
      'o3 是一款全能强大的模型，在多个领域表现出色。它为数学、科学、编程和视觉推理任务树立了新标杆。它也擅长技术写作和指令遵循。用户可利用它分析文本、代码和图像，解决多步骤的复杂问题。',
    displayName: 'o3',
    enabled: true,
    id: 'o3',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 40, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    config: {
      deploymentName: 'o4-mini',
    },
    contextWindowTokens: 200_000,
    description:
      'o4-mini 是我们最新的小型 o 系列模型。 它专为快速有效的推理而优化，在编码和视觉任务中表现出极高的效率和性能。',
    displayName: 'o4-mini',
    enabled: true,
    id: 'o4-mini',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.275, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-4.1',
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 是我们用于复杂任务的旗舰模型。它非常适合跨领域解决问题。',
    displayName: 'GPT-4.1',
    enabled: true,
    id: 'gpt-4.1',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-4.1-mini',
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
    displayName: 'GPT-4.1 mini',
    enabled: true,
    id: 'gpt-4.1-mini',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-4.1-nano',
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
    displayName: 'GPT-4.1 nano',
    id: 'gpt-4.1-nano',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.025, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    config: {
      deploymentName: 'o3-mini',
    },
    contextWindowTokens: 200_000,
    description:
      'o3-mini 是我们最新的小型推理模型，在与 o1-mini 相同的成本和延迟目标下提供高智能。',
    displayName: 'o3-mini',
    id: 'o3-mini',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.55, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-31',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    config: {
      deploymentName: 'o1-mini',
    },
    contextWindowTokens: 128_000,
    description:
      'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-mini',
    id: 'o1-mini',
    maxOutput: 65_536,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.55, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 1.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-09-12',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    config: {
      deploymentName: 'o1',
    },
    contextWindowTokens: 200_000,
    description:
      'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
    displayName: 'o1',
    id: 'o1',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 7.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 60, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-12-17',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    config: {
      deploymentName: 'o1-preview',
    },
    contextWindowTokens: 128_000,
    description:
      'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-preview',
    id: 'o1-preview',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 60, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-09-12',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-4o',
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o',
    enabled: true,
    id: 'gpt-4o',
    maxOutput: 4096,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-05-13',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-4-turbo',
    },
    contextWindowTokens: 128_000,
    description: 'GPT 4 Turbo，多模态模型，提供杰出的语言理解和生成能力，同时支持图像输入。',
    displayName: 'GPT 4 Turbo',
    id: 'gpt-4',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'gpt-4o-mini',
    },
    contextWindowTokens: 128_000,
    description: 'GPT-4o Mini，小型高效模型，具备与GPT-4o相似的卓越性能。',
    displayName: 'GPT 4o Mini',
    id: 'gpt-4o-mini',
    maxOutput: 4096,
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.075, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

const azureImageModels: AIImageModelCard[] = [
  {
    description: 'ChatGPT Image 1',
    displayName: 'GPT Image 1',
    enabled: true,
    id: 'gpt-image-1',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
      size: {
        default: 'auto',
        enum: ['auto', '1024x1024', '1536x1024', '1024x1536'],
      },
    },
    type: 'image',
  },
  {
    description: 'DALL·E 3',
    displayName: 'DALL·E 3',
    id: 'dall-e-3',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
      size: {
        default: 'auto',
        enum: ['auto', '1024x1024', '1792x1024', '1024x1792'],
      },
    },
    resolutions: ['1024x1024', '1024x1792', '1792x1024'],
    type: 'image',
  },
  {
    description: 'FLUX.1 Kontext [pro]',
    displayName: 'FLUX.1 Kontext [pro]',
    enabled: true,
    id: 'FLUX.1-Kontext-pro',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
      size: {
        default: 'auto',
        enum: ['auto', '1024x1024', '1792x1024', '1024x1792'],
      },
    },
    releasedAt: '2025-06-23',
    type: 'image',
  },
  {
    description: 'FLUX.1.1 Pro',
    displayName: 'FLUX.1.1 Pro',
    enabled: true,
    id: 'FLUX-1.1-pro',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
    },
    releasedAt: '2025-06-23',
    type: 'image',
  },
];

export const allModels = [...azureChatModels, ...azureImageModels];

export default allModels;
