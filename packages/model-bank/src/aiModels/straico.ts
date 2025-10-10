import { AIChatModelCard } from '../types/aiModel';

const straicoModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Meta Llama 3.3 70B Instruct - 高性能的Llama系列模型，适合各种推理和生成任务。',
    displayName: 'GPT-4.1 Nano',
    id: 'openai/gpt-4.1-nano',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...straicoModels];

export default allModels;
