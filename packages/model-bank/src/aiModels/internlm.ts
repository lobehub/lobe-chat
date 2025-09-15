import { AIChatModelCard } from '../types/aiModel';

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
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
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
      '我们仍在维护的老版本模型，经过多轮迭代有着极其优异且稳定的性能，包含 7B、20B 多种模型参数量可选，支持 1M 的上下文长度以及更强的指令跟随和工具调用能力。默认指向我们最新发布的 InternLM2.5 系列模型，当前指向 internlm2.5-20b-chat。',
    displayName: 'InternLM2.5',
    id: 'internlm2.5-latest',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      '我们最新发布多模态大模型，具备更强的图文理解能力、长时序图片理解能力，性能比肩顶尖闭源模型。默认指向我们最新发布的 InternVL 系列模型，当前指向 internvl3-78b。',
    displayName: 'InternVL3',
    enabled: true,
    id: 'internvl3-latest',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      '我们仍在维护的 InternVL2.5 版本，具备优异且稳定的性能。默认指向我们最新发布的 InternVL2.5 系列模型，当前指向 internvl2.5-78b。',
    displayName: 'InternVL2.5',
    id: 'internvl2.5-latest',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...internlmChatModels];

export default allModels;
