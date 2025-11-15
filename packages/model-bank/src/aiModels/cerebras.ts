import { AIChatModelCard } from '../types/aiModel';

const cerebrasModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 131_072,
    description:
      '在编程与推理任务上表现优良，支持流式与工具调用，适合 agentic 编码与复杂推理场景。',
    displayName: 'GLM-4.6',
    enabled: true,
    id: 'zai-glm-4.6',
    maxOutput: 40_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 2.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.75, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'GPT OSS 120B',
    enabled: true,
    id: 'gpt-oss-120b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.35, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen 3 32B：Qwen 系列在多语言与编码任务上表现优良，适合中等规模生产化使用。',
    displayName: 'Qwen 3 32B',
    id: 'qwen-3-32b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'Qwen 3 235B Instruct',
    id: 'qwen-3-235b-a22b-instruct-2507',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Llama 3.3 70B：中大型 Llama 模型，兼顾推理能力与吞吐。',
    displayName: 'Llama 3.3 70B',
    id: 'llama-3.3-70b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.85, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: 'Llama 3.1 8B：小体量、低延迟的 Llama 变体，适合轻量在线推理与交互场景。',
    displayName: 'Llama 3.1 8B',
    id: 'llama3.1-8b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...cerebrasModels];

export default allModels;
