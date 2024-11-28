import { AIChatModelCard } from '@/types/aiModel';

const upstageChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Solar Mini 是一种紧凑型 LLM，性能优于 GPT-3.5，具备强大的多语言能力，支持英语和韩语，提供高效小巧的解决方案。',
    displayName: 'Solar Mini',
    enabled: true,
    id: 'solar-1-mini-chat',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Solar Mini (Ja) 扩展了 Solar Mini 的能力，专注于日语，同时在英语和韩语的使用中保持高效和卓越性能。',
    displayName: 'Solar Mini (Ja)',
    id: 'solar-1-mini-chat-ja',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description:
      'Solar Pro 是 Upstage 推出的一款高智能LLM，专注于单GPU的指令跟随能力，IFEval得分80以上。目前支持英语，正式版本计划于2024年11月推出，将扩展语言支持和上下文长度。',
    displayName: 'Solar Pro',
    enabled: true,
    id: 'solar-pro',
    type: 'chat',
  },
];

export const allModels = [...upstageChatModels];

export default allModels;
