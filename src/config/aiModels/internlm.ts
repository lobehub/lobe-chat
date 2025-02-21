import { AIChatModelCard } from '@/types/aiModel';

// https://internlm.intern-ai.org.cn/api/document

const internlmChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      '我们最新的模型系列，有着卓越的推理性能，领跑同量级开源模型。默认指向我们最新发布的 InternLM3 系列模型，当前指向 internlm3-8b-instruct。',
    displayName: 'InternLM3',
    enabled: true,
    id: 'internlm3-latest',
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
    description:
      '我们仍在维护的老版本模型，经过多轮迭代有着极其优异且稳定的性能，包含 7B、20B 多种模型参数量可选，支持 1M 的上下文长度以及更强的指令跟随和工具调用能力。默认指向我们最新发布的 InternLM2.5 系列模型，当前指向 internlm2.5-20b-chat。',
    displayName: 'InternLM2.5',
    enabled: true,
    id: 'internlm2.5-latest',
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
    description: 'InternLM2 版本最大的模型，专注于高度复杂的任务',
    displayName: 'InternLM2 Pro Chat',
    id: 'internlm2-pro-chat',
    pricing: {
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
];

export const allModels = [...internlmChatModels];

export default allModels;
