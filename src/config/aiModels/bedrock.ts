import { AIChatModelCard } from '@/types/aiModel';

// Helper function to create model configurations with defaults
const createModel = (
  config: Partial<AIChatModelCard> & {
    description: string;
    displayName: string;
    id: string;
    pricing: { input: number; output: number };
  },
): AIChatModelCard => ({
  abilities: { functionCall: true },
  contextWindowTokens: 128_000,
  enabled: true,
  type: 'chat',
  ...config,
});

// Amazon Nova Models (Cross-Region Inference Profiles)
const novaModels: AIChatModelCard[] = [
  createModel({
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 300_000,
    description:
      'Amazon Nova Premier 是 Amazon 最先进的多模态基础模型，具有最高的智能水平，能够处理复杂的推理、数学、编程和多语言任务。',
    displayName: 'Nova Premier (US)',
    id: 'us.amazon.nova-premier-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 8,
      output: 32,
    },
    releasedAt: '2024-12-03',
  }),
  createModel({
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 300_000,
    description:
      'Amazon Nova Pro 在性能和成本之间取得平衡，适合各种任务，包括内容生成、对话AI、文档处理和代码生成。',
    displayName: 'Nova Pro (US)',
    id: 'us.amazon.nova-pro-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.8,
      output: 3.2,
    },
    releasedAt: '2024-12-03',
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 300_000,
    description:
      'Amazon Nova Lite 是一个快速、成本效益高的多模态模型，适合简单的任务和高频使用场景。',
    displayName: 'Nova Lite (US)',
    id: 'us.amazon.nova-lite-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.06,
      output: 0.24,
    },
    releasedAt: '2024-12-03',
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Amazon Nova Micro 是一个仅文本的模型，专为速度和成本效率而设计，适合简单的文本处理任务。',
    displayName: 'Nova Micro (US)',
    id: 'us.amazon.nova-micro-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.035,
      output: 0.14,
    },
    releasedAt: '2024-12-03',
  }),
  // EU Region Nova Models
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 300_000,
    description: 'Amazon Nova Pro 欧盟区域版本，在性能和成本之间取得平衡。',
    displayName: 'Nova Pro (EU)',
    id: 'eu.amazon.nova-pro-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.8,
      output: 3.2,
    },
    releasedAt: '2024-12-03',
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 300_000,
    description: 'Amazon Nova Lite 欧盟区域版本，快速且成本效益高。',
    displayName: 'Nova Lite (EU)',
    id: 'eu.amazon.nova-lite-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.06,
      output: 0.24,
    },
    releasedAt: '2024-12-03',
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Amazon Nova Micro 欧盟区域版本，专为速度和成本效率而设计。',
    displayName: 'Nova Micro (EU)',
    id: 'eu.amazon.nova-micro-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.035,
      output: 0.14,
    },
    releasedAt: '2024-12-03',
  }),
  // APAC Region Nova Models
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 300_000,
    description: 'Amazon Nova Pro 亚太区域版本，在性能和成本之间取得平衡。',
    displayName: 'Nova Pro (APAC)',
    id: 'apac.amazon.nova-pro-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.8,
      output: 3.2,
    },
    releasedAt: '2024-12-03',
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 300_000,
    description: 'Amazon Nova Lite 亚太区域版本，快速且成本效益高。',
    displayName: 'Nova Lite (APAC)',
    id: 'apac.amazon.nova-lite-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.06,
      output: 0.24,
    },
    releasedAt: '2024-12-03',
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Amazon Nova Micro 亚太区域版本，专为速度和成本效率而设计。',
    displayName: 'Nova Micro (APAC)',
    id: 'apac.amazon.nova-micro-v1:0',
    maxOutput: 5000,
    pricing: {
      input: 0.035,
      output: 0.14,
    },
    releasedAt: '2024-12-03',
  }),
];

// Claude Models
const claudeModels: AIChatModelCard[] = [
  createModel({
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.7 sonnet 是 Anthropic 最快的下一代模型。与 Claude 3 Haiku 相比，Claude 3.7 Sonnet 在各项技能上都有所提升，并在许多智力基准测试中超越了上一代最大的模型 Claude 3 Opus。',
    displayName: 'Claude 3.7 Sonnet (US)',
    id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-02-24',
  }),
  createModel({
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3.7 Sonnet 欧盟区域版本，是 Anthropic 最快的下一代模型。',
    displayName: 'Claude 3.7 Sonnet (EU)',
    id: 'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-02-24',
  }),
  createModel({
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3.7 Sonnet 亚太区域版本，是 Anthropic 最快的下一代模型。',
    displayName: 'Claude 3.7 Sonnet (APAC)',
    id: 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0',
    maxOutput: 8192,
    pricing: {
      input: 3,
      output: 15,
    },
    releasedAt: '2025-02-24',
  }),

  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提升了行业标准，性能超过竞争对手模型和 Claude 3 Opus，在广泛的评估中表现出色，同时具有我们中等层级模型的速度和成本。',
    displayName: 'Claude 3.5 Sonnet v2 (US)',
    id: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-10-22',
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3.5 Sonnet 亚太区域版本，提升了行业标准。',
    displayName: 'Claude 3.5 Sonnet v2 (APAC)',
    id: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxOutput: 8192,
    pricing: {
      input: 3,
      output: 15,
    },
    releasedAt: '2024-10-22',
  }),

  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提升了行业标准，性能超过竞争对手模型和 Claude 3 Opus，在广泛的评估中表现出色，同时具有我们中等层级模型的速度和成本。',
    displayName: 'Claude 3.5 Sonnet 0620 (US)',
    id: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-06-20',
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3.5 Sonnet 0620 亚太区域版本，提升了行业标准。',
    displayName: 'Claude 3.5 Sonnet 0620 (APAC)',
    id: 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
    maxOutput: 8192,
    pricing: {
      input: 3,
      output: 15,
    },
    releasedAt: '2024-06-20',
  }),

  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Haiku 是 Anthropic 最快、最紧凑的模型，提供近乎即时的响应速度。跨区域推理配置文件版本。',
    displayName: 'Claude 3 Haiku (US)',
    id: 'us.anthropic.claude-3-haiku-20240307-v1:0',
    maxOutput: 4096,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-03-07',
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3 Haiku 欧盟区域版本，是 Anthropic 最快、最紧凑的模型。',
    displayName: 'Claude 3 Haiku (EU)',
    id: 'eu.anthropic.claude-3-haiku-20240307-v1:0',
    maxOutput: 4096,
    pricing: {
      input: 0.25,
      output: 1.25,
    },
    releasedAt: '2024-03-07',
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3 Haiku 亚太区域版本，是 Anthropic 最快、最紧凑的模型。',
    displayName: 'Claude 3 Haiku (APAC)',
    id: 'apac.anthropic.claude-3-haiku-20240307-v1:0',
    maxOutput: 4096,
    pricing: {
      input: 0.25,
      output: 1.25,
    },
    releasedAt: '2024-03-07',
  }),

  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3 Sonnet 在智能和速度之间达到了理想的平衡。跨区域推理配置文件版本。',
    displayName: 'Claude 3 Sonnet (US)',
    id: 'us.anthropic.claude-3-sonnet-20240229-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3 Sonnet 欧盟区域版本，在智能和速度之间达到了理想的平衡。',
    displayName: 'Claude 3 Sonnet (EU)',
    id: 'eu.anthropic.claude-3-sonnet-20240229-v1:0',
    pricing: {
      input: 3,
      output: 15,
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3 Sonnet 亚太区域版本，在智能和速度之间达到了理想的平衡。',
    displayName: 'Claude 3 Sonnet (APAC)',
    id: 'apac.anthropic.claude-3-sonnet-20240229-v1:0',
    pricing: {
      input: 3,
      output: 15,
    },
  }),

  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Opus 是 Anthropic 最强大的 AI 模型，具有在高度复杂任务上的最先进性能。跨区域推理配置文件版本。',
    displayName: 'Claude 3 Opus (US)',
    id: 'us.anthropic.claude-3-opus-20240229-v1:0',
    maxOutput: 4096,
    pricing: {
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 75, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-02-29',
  }),
  // Claude 4 Models
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 4 Opus 是 Anthropic 最新一代的旗舰模型，具有前所未有的智能水平和推理能力。',
    displayName: 'Claude 4 Opus (US)',
    id: 'us.anthropic.claude-opus-4-20250514-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 4 Sonnet 是 Anthropic 新一代的平衡型模型，在智能和效率之间取得最佳平衡。',
    displayName: 'Claude 4 Sonnet (US)',
    id: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 4 Sonnet 欧盟区域版本，是 Anthropic 新一代的平衡型模型。',
    displayName: 'Claude 4 Sonnet (EU)',
    id: 'eu.anthropic.claude-sonnet-4-20250514-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 4 Sonnet 亚太区域版本，是 Anthropic 新一代的平衡型模型。',
    displayName: 'Claude 4 Sonnet (APAC)',
    id: 'apac.anthropic.claude-sonnet-4-20250514-v1:0',
    pricing: {
      input: 15,
      output: 75,
    },
  }),
  // US GovCloud Models
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3.5 Sonnet 美国政府专区版本，提升了行业标准。',
    displayName: 'Claude 3.5 Sonnet (US-Gov)',
    id: 'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
    pricing: {
      input: 3,
      output: 15,
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'Claude 3 Haiku 美国政府专区版本，是 Anthropic 最快、最紧凑的模型。',
    displayName: 'Claude 3 Haiku (US-Gov)',
    id: 'us-gov.anthropic.claude-3-haiku-20240307-v1:0',
    maxOutput: 4096,
    pricing: {
      input: 0.25,
      output: 1.25,
    },
  }),
];

// Llama Models
const llamaModels: AIChatModelCard[] = [
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.1 8B Instruct 跨区域推理配置文件版本。',
    displayName: 'Llama 3.1 8B Instruct (US)',
    id: 'us.meta.llama3-1-8b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.22, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.22, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),

  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.1 70B Instruct 跨区域推理配置文件版本。',
    displayName: 'Llama 3.1 70B Instruct (US)',
    id: 'us.meta.llama3-1-70b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),

  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.1 405B Instruct 跨区域推理配置文件版本，是最大、最强大的模型。',
    displayName: 'Llama 3.1 405B Instruct (US)',
    id: 'us.meta.llama3-1-405b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 5.32, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),

  // Llama 3.2 Models
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.2 11B Instruct 是一个中等规模的高效模型，适合各种对话和推理任务。',
    displayName: 'Llama 3.2 11B Instruct (US)',
    id: 'us.meta.llama3-2-11b-instruct-v1:0',
    pricing: {
      input: 0.35,
      output: 0.35,
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.2 1B Instruct 是一个轻量级模型，专为资源受限环境设计。',
    displayName: 'Llama 3.2 1B Instruct (US)',
    id: 'us.meta.llama3-2-1b-instruct-v1:0',
    pricing: {
      input: 0.055,
      output: 0.055,
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.2 1B Instruct 欧盟区域版本，是一个轻量级模型。',
    displayName: 'Llama 3.2 1B Instruct (EU)',
    id: 'eu.meta.llama3-2-1b-instruct-v1:0',
    pricing: {
      input: 0.055,
      output: 0.055,
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Meta Llama 3.2 3B Instruct 是一个小型但功能强大的模型，在效率和性能之间取得平衡。',
    displayName: 'Llama 3.2 3B Instruct (US)',
    id: 'us.meta.llama3-2-3b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.2 3B Instruct 欧盟区域版本，在效率和性能之间取得平衡。',
    displayName: 'Llama 3.2 3B Instruct (EU)',
    id: 'eu.meta.llama3-2-3b-instruct-v1:0',
    pricing: {
      input: 0.075,
      output: 0.075,
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.2 90B Instruct 是一个大型高性能模型，适合复杂的推理和生成任务。',
    displayName: 'Llama 3.2 90B Instruct (US)',
    id: 'us.meta.llama3-2-90b-instruct-v1:0',
    pricing: {
      input: 2,
      output: 2,
    },
  }),
  // Llama 3.3 Models
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 3.3 70B Instruct 是最新一代的高性能模型，具有改进的推理和对话能力。',
    displayName: 'Llama 3.3 70B Instruct (US)',
    id: 'us.meta.llama3-3-70b-instruct-v1:0',
    pricing: {
      input: 0.99,
      output: 0.99,
    },
  }),
  // Llama 4 Models
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Meta Llama 4 Maverick 17B Instruct 是下一代模型的早期版本，具有创新的架构和能力。',
    displayName: 'Llama 4 Maverick 17B Instruct (US)',
    id: 'us.meta.llama4-maverick-17b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 2.65, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Meta Llama 4 Scout 17B Instruct 是下一代模型的探索版本，专注于高效的推理和生成。',
    displayName: 'Llama 4 Scout 17B Instruct (US)',
    id: 'us.meta.llama4-scout-17b-instruct-v1:0',
    pricing: {
      input: 0.5,
      output: 0.5,
    },
  }),
];

// Other Models (DeepSeek, Mistral, etc.)
const otherModels: AIChatModelCard[] = [
  createModel({
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description: 'DeepSeek R1 是一个具有强大推理能力的模型，专门针对复杂问题解决进行优化。',
    displayName: 'DeepSeek R1 (US)',
    id: 'us.deepseek.r1-v1:0',
    pricing: {
      input: 0.14,
      output: 2.19,
    },
  }),
  // Mistral Models (Cross-Region)
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Mistral Pixtral Large 是一个多模态模型，能够处理文本和图像输入，具有强大的视觉理解能力。',
    displayName: 'Pixtral Large 2502 (US)',
    id: 'us.mistral.pixtral-large-2502-v1:0',
    pricing: {
      input: 3,
      output: 9,
    },
  }),
  createModel({
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description: 'Mistral Pixtral Large 欧盟区域版本，是一个多模态模型。',
    displayName: 'Pixtral Large 2502 (EU)',
    id: 'eu.mistral.pixtral-large-2502-v1:0',
    pricing: {
      input: 3,
      output: 9,
    },
  }),
];

// Combine all models
const bedrockChatModels: AIChatModelCard[] = [
  ...novaModels,
  ...claudeModels,
  ...llamaModels,
  ...otherModels,
];

export const allModels = bedrockChatModels;
export { claudeModels, llamaModels, novaModels, otherModels };
export default allModels;
