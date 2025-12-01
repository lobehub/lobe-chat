import { AIChatModelCard } from '../types/aiModel';

// https://platform.moonshot.cn/docs/pricing/chat
const moonshotChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 262_144,
    description: 'K2 long-thinking model with 256k context support, multi-step tool calling and reasoning capabilities, excelling at solving complex problems.',
    displayName: 'Kimi K2 Thinking',
    enabled: true,
    id: 'kimi-k2-thinking',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 262_144,
    description:
      'High-speed version of the K2 long-thinking model with 256k context support, excelling at deep reasoning with output speed improved to 60-100 tokens per second.',
    displayName: 'Kimi K2 Thinking Turbo',
    id: 'kimi-k2-thinking-turbo',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 58, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
    },
    contextWindowTokens: 262_144,
    description:
      'kimi-k2-0905-preview model with 256k context length, featuring enhanced Agentic Coding capabilities, superior frontend code aesthetics and practicality, and improved context understanding.',
    displayName: 'Kimi K2 0905',
    enabled: true,
    id: 'kimi-k2-0905-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-09-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'kimi-k2 is a MoE architecture foundation model with exceptional code and Agent capabilities, featuring 1T total parameters and 32B activated parameters. K2 model performance exceeds other mainstream open-source models in benchmark tests across major categories including general knowledge reasoning, programming, mathematics, and Agent tasks.',
    displayName: 'Kimi K2 0711',
    id: 'kimi-k2-0711-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-07-11',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      'kimi-k2 is a MoE architecture foundation model with exceptional code and Agent capabilities, featuring 1T total parameters and 32B activated parameters. K2 model performance exceeds other mainstream open-source models in benchmark tests across major categories including general knowledge reasoning, programming, mathematics, and Agent tasks.',
    displayName: 'Kimi K2 0905 Turbo',
    id: 'kimi-k2-turbo-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 64, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-09-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi smart assistant product powered by the latest Kimi large model, may include features that are not yet stable. Supports image understanding and automatically selects 8k/32k/128k models for billing based on request context length.',
    displayName: 'Kimi Latest',
    enabled: true,
    id: 'kimi-latest',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-02-17',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'kimi-thinking-preview model is a multimodal thinking model provided by Moonshot AI with multimodal reasoning and general reasoning capabilities, excelling at deep reasoning to help solve more complex problems.',
    displayName: 'Kimi Thinking Preview',
    enabled: true,
    id: 'kimi-thinking-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 200, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 200, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-05-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Moonshot V1 Auto automatically selects the appropriate model based on the current context token count.',
    displayName: 'Moonshot V1 Auto',
    id: 'moonshot-v1-auto',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'Moonshot V1 8K is designed for short text generation tasks with efficient processing performance, capable of handling 8,192 tokens, ideal for brief conversations, quick notes, and rapid content generation.',
    displayName: 'Moonshot V1 8K',
    id: 'moonshot-v1-8k',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Moonshot V1 32K provides medium-length context processing capability, capable of handling 32,768 tokens, particularly suitable for generating various long documents and complex conversations, applicable in content creation, report generation, and dialogue systems.',
    displayName: 'Moonshot V1 32K',
    id: 'moonshot-v1-32k',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Moonshot V1 128K is a model with ultra-long context processing capability, suitable for generating extremely long texts to meet complex generation task requirements, capable of handling up to 128,000 tokens, ideal for research, academic, and large document generation scenarios.',
    displayName: 'Moonshot V1 128K',
    id: 'moonshot-v1-128k',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 8192,
    description:
      'Kimi vision models (including moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview) can understand image content, including image text, colors, and object shapes.',
    displayName: 'Moonshot V1 8K Vision Preview',
    id: 'moonshot-v1-8k-vision-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Kimi vision models (including moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview) can understand image content, including image text, colors, and object shapes.',
    displayName: 'Moonshot V1 32K Vision Preview',
    id: 'moonshot-v1-32k-vision-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi vision models (including moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview) can understand image content, including image text, colors, and object shapes.',
    displayName: 'Moonshot V1 128K Vision Preview',
    id: 'moonshot-v1-128k-vision-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-14',
    type: 'chat',
  },
];

export const allModels = [...moonshotChatModels];

export default allModels;
