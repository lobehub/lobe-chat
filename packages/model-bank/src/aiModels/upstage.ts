import { AIChatModelCard } from '../types/aiModel';

// https://console.upstage.ai/docs/capabilities/chat

const upstageChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 32_768,
    description:
      'Solar Pro 是 Upstage 推出的一款高智能LLM，专注于单GPU的指令跟随能力，IFEval得分80以上。目前支持英语，正式版本计划于2024年11月推出，将扩展语言支持和上下文长度。',
    displayName: 'Solar Pro',
    enabled: true,
    id: 'solar-pro',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-11-26',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Solar Mini 是一种紧凑型 LLM，性能优于 GPT-3.5，具备强大的多语言能力，支持英语和韩语，提供高效小巧的解决方案。',
    displayName: 'Solar Mini',
    enabled: true,
    id: 'solar-mini',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-23',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Solar Mini (Ja) 扩展了 Solar Mini 的能力，专注于日语，同时在英语和韩语的使用中保持高效和卓越性能。',
    displayName: 'Solar Mini (Ja)',
    id: 'solar-mini-ja', // deprecated on 2025-04-10
    releasedAt: '2025-01-23',
    type: 'chat',
  },
];

export const allModels = [...upstageChatModels];

export default allModels;
