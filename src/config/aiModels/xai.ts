import { AIChatModelCard } from '@/types/aiModel';
// https://docs.x.ai/docs/models
const xaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '旗舰级模型，擅长数据提取、编程和文本摘要等企业级应用，拥有金融、医疗、法律和科学等领域的深厚知识。',
    displayName: 'Grok 3 Beta',
    enabled: true,
    id: 'grok-3-beta',
    pricing: {
      input: 3,
      output: 15,
    },
    releasedAt: '2025-04-03',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '旗舰级模型，擅长数据提取、编程和文本摘要等企业级应用，拥有金融、医疗、法律和科学等领域的深厚知识。',
    displayName: 'Grok 3 Beta (Fast mode)',
    id: 'grok-3-fast-beta',
    pricing: {
      input: 5,
      output: 25,
    },
    releasedAt: '2025-04-03',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: '轻量级模型，回话前会先思考。运行快速、智能，适用于不需要深层领域知识的逻辑任务，并能获取原始的思维轨迹。',
    displayName: 'Grok 3 Mini Beta',
    enabled: true,
    id: 'grok-3-mini-beta',
    pricing: {
      input: 0.3,
      output: 0.5,
    },
    releasedAt: '2025-04-03',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: '轻量级模型，回话前会先思考。运行快速、智能，适用于不需要深层领域知识的逻辑任务，并能获取原始的思维轨迹。',
    displayName: 'Grok 3 Mini Beta (Fast mode)',
    id: 'grok-3-mini-fast-beta',
    pricing: {
      input: 0.6,
      output: 4,
    },
    releasedAt: '2025-04-03',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: '该模型在准确性、指令遵循和多语言能力方面有所改进。',
    displayName: 'Grok 2 Vision 1212',
    enabled: true,
    id: 'grok-2-vision-1212',
    pricing: {
      input: 2,
      output: 10,
    },
    releasedAt: '2024-12-12',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '该模型在准确性、指令遵循和多语言能力方面有所改进。',
    displayName: 'Grok 2 1212',
    id: 'grok-2-1212', // legacy
    pricing: {
      input: 2,
      output: 10,
    },
    releasedAt: '2024-12-12',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '拥有与 Grok 2 相当的性能，但具有更高的效率、速度和功能。',
    displayName: 'Grok Beta',
    id: 'grok-beta', // legacy
    pricing: {
      input: 5,
      output: 15,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 8192,
    description: '最新的图像理解模型，可以处理各种各样的视觉信息，包括文档、图表、截图和照片等。',
    displayName: 'Grok Vision Beta',
    id: 'grok-vision-beta', // legacy
    pricing: {
      input: 5,
      output: 15,
    },
    type: 'chat',
  },
];

export const allModels = [...xaiChatModels];

export default allModels;
