import { AIChatModelCard } from '@/types/aiModel';

const internlmChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      '我们最新的模型系列，有着卓越的推理性能，支持 1M 的上下文长度以及更强的指令跟随和工具调用能力。',
    displayName: 'InternLM2.5',
    enabled: true,
    id: 'internlm2.5-latest',
    maxOutput: 4096,
    pricing: {
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: '我们仍在维护的老版本模型，有 7B、20B 多种模型参数量可选。',
    displayName: 'InternLM2 Pro Chat',
    id: 'internlm2-pro-chat',
    maxOutput: 4096,
    pricing: {
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
];

export const allModels = [...internlmChatModels];

export default allModels;
