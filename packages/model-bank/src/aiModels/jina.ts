import { AIChatModelCard } from '../types/aiModel';

const jinaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      '深度搜索结合了网络搜索、阅读和推理，可进行全面调查。您可以将其视为一个代理，接受您的研究任务 - 它会进行广泛搜索并经过多次迭代，然后才能给出答案。这个过程涉及持续的研究、推理和从各个角度解决问题。这与直接从预训练数据生成答案的标准大模型以及依赖一次性表面搜索的传统 RAG 系统有着根本的不同。',
    displayName: 'Jina DeepSearch v1',
    enabled: true,
    id: 'jina-deepsearch-v1',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.02, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.02, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
];

export const allModels = [...jinaChatModels];

export default allModels;
