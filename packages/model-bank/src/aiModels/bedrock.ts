import { AIChatModelCard } from '../types/aiModel';

const bedrockChatModels: AIChatModelCard[] = [
  /*
    // TODO: Not support for now
    {
      description: '亚马逊 Titan Text Lite 是一款轻量级高效模型，非常适合对英语任务进行微调，包括总结和文案编写等，客户希望有一个更小、更经济的模型，同时也非常可定制。',
      displayName: 'Titan Text G1 - Lite',
      id: 'amazon.titan-text-lite-v1',
      tokens: 4000,
    },
    {
      description: '亚马逊 Titan Text Express 的上下文长度可达 8,000 个标记，非常适合广泛的高级通用语言任务，如开放式文本生成和对话聊天，以及在检索增强生成 (RAG) 中的支持。在推出时，该模型针对英语进行了优化，预览版还支持其他 100 多种语言。',
      displayName: 'Titan Text G1 - Express',
      id: 'amazon.titan-text-express-v1',
      tokens: 8000,
    },
    {
      description: 'Titan Text Premier 是 Titan Text 系列中一款强大的先进模型，旨在为广泛的企业应用提供卓越的性能。凭借其尖端能力，它提供了更高的准确性和卓越的结果，是寻求一流文本处理解决方案的组织的绝佳选择。',
      displayName: 'Titan Text G1 - Premier',
      id: 'amazon.titan-text-premier-v1:0',
      tokens: 32_000,
    },
*/
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.7 sonnet 是 Anthropic 最快的下一代模型。与 Claude 3 Haiku 相比，Claude 3.7 Sonnet 在各项技能上都有所提升，并在许多智力基准测试中超越了上一代最大的模型 Claude 3 Opus。',
    displayName: 'Claude 3.7 Sonnet',
    enabled: true,
    id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-02-24',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提升了行业标准，性能超过竞争对手模型和 Claude 3 Opus，在广泛的评估中表现出色，同时具有我们中等层级模型的速度和成本。',
    displayName: 'Claude 3.5 Sonnet',
    enabled: true,
    id: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-10-22',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提升了行业标准，性能超过竞争对手模型和 Claude 3 Opus，在广泛的评估中表现出色，同时具有我们中等层级模型的速度和成本。',
    displayName: 'Claude 3.5 Sonnet v2 (Inference profile)',
    enabled: true,
    id: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-10-22',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提升了行业标准，性能超过竞争对手模型和 Claude 3 Opus，在广泛的评估中表现出色，同时具有我们中等层级模型的速度和成本。',
    displayName: 'Claude 3.5 Sonnet 0620',
    enabled: true,
    id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    maxOutput: 8192,
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-06-20',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Haiku 是 Anthropic 最快、最紧凑的模型，提供近乎即时的响应速度。它可以快速回答简单的查询和请求。客户将能够构建模仿人类互动的无缝 AI 体验。Claude 3 Haiku 可以处理图像并返回文本输出，具有 200K 的上下文窗口。',
    displayName: 'Claude 3 Haiku',
    enabled: true,
    id: 'anthropic.claude-3-haiku-20240307-v1:0',
    maxOutput: 4096,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-03-07',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Anthropic 的 Claude 3 Sonnet 在智能和速度之间达到了理想的平衡——特别适合企业工作负载。它以低于竞争对手的价格提供最大的效用，并被设计成为可靠的、高耐用的主力机，适用于规模化的 AI 部署。Claude 3 Sonnet 可以处理图像并返回文本输出，具有 200K 的上下文窗口。',
    displayName: 'Claude 3 Sonnet',
    enabled: true,
    id: 'anthropic.claude-3-sonnet-20240229-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Opus 是 Anthropic 最强大的 AI 模型，具有在高度复杂任务上的最先进性能。它可以处理开放式提示和未见过的场景，具有出色的流畅性和类人的理解能力。Claude 3 Opus 展示了生成 AI 可能性的前沿。Claude 3 Opus 可以处理图像并返回文本输出，具有 200K 的上下文窗口。',
    displayName: 'Claude 3 Opus',
    enabled: true,
    id: 'anthropic.claude-3-opus-20240229-v1:0',
    maxOutput: 4096,
    pricing: {
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 75, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-02-29',
    type: 'chat',
  },
  {
    contextWindowTokens: 200_000,
    description:
      'Claude 2 的更新版，具有双倍的上下文窗口，以及在长文档和 RAG 上下文中的可靠性、幻觉率和基于证据的准确性的改进。',
    displayName: 'Claude 2.1',
    id: 'anthropic.claude-v2:1',
    pricing: {
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 100_000,
    description:
      'Anthropic 在从复杂对话和创意内容生成到详细指令跟随的广泛任务中都表现出高度能力的模型。',
    displayName: 'Claude 2.0',
    id: 'anthropic.claude-v2',
    pricing: {
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 100_000,
    description:
      '一款快速、经济且仍然非常有能力的模型，可以处理包括日常对话、文本分析、总结和文档问答在内的一系列任务。',
    displayName: 'Claude Instant',
    id: 'anthropic.claude-instant-v1',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Meta Llama 3.1 8B Instruct 的更新版，包括扩展的 128K 上下文长度、多语言性和改进的推理能力。Llama 3.1 提供的多语言大型语言模型 (LLMs) 是一组预训练的、指令调整的生成模型，包括 8B、70B 和 405B 大小 (文本输入/输出)。Llama 3.1 指令调整的文本模型 (8B、70B、405B) 专为多语言对话用例进行了优化，并在常见的行业基准测试中超过了许多可用的开源聊天模型。Llama 3.1 旨在用于多种语言的商业和研究用途。指令调整的文本模型适用于类似助手的聊天，而预训练模型可以适应各种自然语言生成任务。Llama 3.1 模型还支持利用其模型的输出来改进其他模型，包括合成数据生成和精炼。Llama 3.1 是使用优化的变压器架构的自回归语言模型。调整版本使用监督微调 (SFT) 和带有人类反馈的强化学习 (RLHF) 来符合人类对帮助性和安全性的偏好。',
    displayName: 'Llama 3.1 8B Instruct',
    enabled: true,
    id: 'meta.llama3-1-8b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.22, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.22, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Meta Llama 3.1 70B Instruct 的更新版，包括扩展的 128K 上下文长度、多语言性和改进的推理能力。Llama 3.1 提供的多语言大型语言模型 (LLMs) 是一组预训练的、指令调整的生成模型，包括 8B、70B 和 405B 大小 (文本输入/输出)。Llama 3.1 指令调整的文本模型 (8B、70B、405B) 专为多语言对话用例进行了优化，并在常见的行业基准测试中超过了许多可用的开源聊天模型。Llama 3.1 旨在用于多种语言的商业和研究用途。指令调整的文本模型适用于类似助手的聊天，而预训练模型可以适应各种自然语言生成任务。Llama 3.1 模型还支持利用其模型的输出来改进其他模型，包括合成数据生成和精炼。Llama 3.1 是使用优化的变压器架构的自回归语言模型。调整版本使用监督微调 (SFT) 和带有人类反馈的强化学习 (RLHF) 来符合人类对帮助性和安全性的偏好。',
    displayName: 'Llama 3.1 70B Instruct',
    enabled: true,
    id: 'meta.llama3-1-70b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Meta Llama 3.1 405B Instruct 是 Llama 3.1 Instruct 模型中最大、最强大的模型，是一款高度先进的对话推理和合成数据生成模型，也可以用作在特定领域进行专业持续预训练或微调的基础。Llama 3.1 提供的多语言大型语言模型 (LLMs) 是一组预训练的、指令调整的生成模型，包括 8B、70B 和 405B 大小 (文本输入/输出)。Llama 3.1 指令调整的文本模型 (8B、70B、405B) 专为多语言对话用例进行了优化，并在常见的行业基准测试中超过了许多可用的开源聊天模型。Llama 3.1 旨在用于多种语言的商业和研究用途。指令调整的文本模型适用于类似助手的聊天，而预训练模型可以适应各种自然语言生成任务。Llama 3.1 模型还支持利用其模型的输出来改进其他模型，包括合成数据生成和精炼。Llama 3.1 是使用优化的变压器架构的自回归语言模型。调整版本使用监督微调 (SFT) 和带有人类反馈的强化学习 (RLHF) 来符合人类对帮助性和安全性的偏好。',
    displayName: 'Llama 3.1 405B Instruct',
    enabled: true,
    id: 'meta.llama3-1-405b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 5.32, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8000,
    description:
      'Meta Llama 3 是一款面向开发者、研究人员和企业的开放大型语言模型 (LLM)，旨在帮助他们构建、实验并负责任地扩展他们的生成 AI 想法。作为全球社区创新的基础系统的一部分，它非常适合计算能力和资源有限、边缘设备和更快的训练时间。',
    displayName: 'Llama 3 8B Instruct',
    id: 'meta.llama3-8b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8000,
    description:
      'Meta Llama 3 是一款面向开发者、研究人员和企业的开放大型语言模型 (LLM)，旨在帮助他们构建、实验并负责任地扩展他们的生成 AI 想法。作为全球社区创新的基础系统的一部分，它非常适合内容创建、对话 AI、语言理解、研发和企业应用。',
    displayName: 'Llama 3 70B Instruct',
    id: 'meta.llama3-70b-instruct-v1:0',
    pricing: {
      units: [
        { name: 'textInput', rate: 2.65, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...bedrockChatModels];

export default allModels;
