import { AIChatModelCard } from '../types/aiModel';

// https://internlm.intern-ai.org.cn/api/document

const internlmChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Our latest model series with exceptional reasoning performance, leading among open-source models of the same scale. Defaults to our latest InternLM3 series release, currently pointing to internlm3-8b-instruct.',
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
      'Our legacy model series still under maintenance, with excellent and stable performance through multiple iterations. Available in various parameter sizes including 7B and 20B, supporting 1M context length with enhanced instruction-following and tool-calling capabilities. Defaults to our latest InternLM2.5 series release, currently pointing to internlm2.5-20b-chat.',
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
      'Our latest multimodal large model with enhanced image-text understanding and long-sequence image comprehension capabilities, with performance matching top closed-source models. Defaults to our latest InternVL series release, currently pointing to internvl3-78b.',
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
      'Our InternVL2.5 version still under maintenance, with excellent and stable performance. Defaults to our latest InternVL2.5 series release, currently pointing to internvl2.5-78b.',
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
