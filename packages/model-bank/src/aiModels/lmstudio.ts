import { AIChatModelCard } from '../types/aiModel';

const lmStudioChatModels: AIChatModelCard[] = [
  {
    abilities: {},
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
    displayName: 'Llama 3.1 8B',
    enabled: true,
    id: 'llama3.1',
    type: 'chat',
  },
  {
    abilities: {},
    contextWindowTokens: 128_000,
    description: 'Qwen2.5 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2.5 14B',
    enabled: true,
    id: 'qwen2.5-14b-instruct',
    type: 'chat',
  },
];

export const allModels = [...lmStudioChatModels];

export default allModels;
