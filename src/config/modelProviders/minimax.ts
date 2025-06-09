import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.minimaxi.com/document/Models
const Minimax: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 245_760,
      description: '适用于广泛的自然语言处理任务，包括文本生成、对话系统等。',
      displayName: 'abab6.5s',
      enabled: true,
      functionCall: true,
      id: 'abab6.5s-chat',
    },
    {
      contextWindowTokens: 8192,
      description: '专为多语种人设对话设计，支持英文及其他多种语言的高质量对话生成。',
      displayName: 'abab6.5g',
      enabled: true,
      functionCall: true,
      id: 'abab6.5g-chat',
    },
    {
      contextWindowTokens: 8192,
      description: '针对中文人设对话场景优化，提供流畅且符合中文表达习惯的对话生成能力。',
      displayName: 'abab6.5t',
      enabled: true,
      functionCall: true,
      id: 'abab6.5t-chat',
    },
    {
      contextWindowTokens: 16_384,
      description: '面向生产力场景，支持复杂任务处理和高效文本生成，适用于专业领域应用。',
      displayName: 'abab5.5',
      id: 'abab5.5-chat',
    },
    {
      contextWindowTokens: 8192,
      description: '专为中文人设对话场景设计，提供高质量的中文对话生成能力，适用于多种应用场景。',
      displayName: 'abab5.5s',
      id: 'abab5.5s-chat',
    },
  ],
  checkModel: 'abab6.5s-chat',
  description:
    'MiniMax 是 2021 年成立的通用人工智能科技公司，致力于与用户共创智能。MiniMax 自主研发了不同模态的通用大模型，其中包括万亿参数的 MoE 文本大模型、语音大模型以及图像大模型。并推出了海螺 AI 等应用。',
  id: 'minimax',
  modelsUrl: 'https://platform.minimaxi.com/document/Models',
  name: 'Minimax',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.minimax.chat/v1',
    },
    sdkType: 'openai',
    smoothing: {
      speed: 2,
      text: true,
    },
  },
  url: 'https://www.minimaxi.com',
};

export default Minimax;
