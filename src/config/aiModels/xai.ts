import { AIChatModelCard } from '@/types/aiModel';

const xaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '拥有与 Grok 2 相当的性能，但具有更高的效率、速度和功能。',
    displayName: 'Grok Beta',
    enabled: true,
    id: 'grok-beta',
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
    enabled: true,
    id: 'grok-vision-beta',
    pricing: {
      input: 5,
      output: 15,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '该模型在准确性、指令遵循和多语言能力方面有所改进。',
    displayName: 'Grok 2 1212',
    enabled: true,
    id: 'grok-2-1212',
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
];

export const allModels = [...xaiChatModels];

export default allModels;
