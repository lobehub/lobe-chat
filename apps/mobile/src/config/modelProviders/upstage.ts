import { ModelProviderCard } from '@/types/llm';

// ref :https://developers.upstage.ai/docs/getting-started/models
const Upstage: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 32_768,
      description:
        'Solar Mini 是一种紧凑型 LLM，性能优于 GPT-3.5，具备强大的多语言能力，支持英语和韩语，提供高效小巧的解决方案。',
      displayName: 'Solar Mini',
      enabled: true,
      functionCall: true,
      id: 'solar-1-mini-chat',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Solar Mini (Ja) 扩展了 Solar Mini 的能力，专注于日语，同时在英语和韩语的使用中保持高效和卓越性能。',
      displayName: 'Solar Mini (Ja)',
      functionCall: false,
      id: 'solar-1-mini-chat-ja',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Solar Pro 是 Upstage 推出的一款高智能LLM，专注于单GPU的指令跟随能力，IFEval得分80以上。目前支持英语，正式版本计划于2024年11月推出，将扩展语言支持和上下文长度。',
      displayName: 'Solar Pro',
      enabled: true,
      functionCall: false,
      id: 'solar-pro',
    },
  ],
  checkModel: 'solar-1-mini-chat',
  description:
    'Upstage 专注于为各种商业需求开发AI模型，包括 Solar LLM 和文档 AI，旨在实现工作的人造通用智能（AGI）。通过 Chat API 创建简单的对话代理，并支持功能调用、翻译、嵌入以及特定领域应用。',
  id: 'upstage',
  modelsUrl: 'https://developers.upstage.ai/docs/getting-started/models',
  name: 'Upstage',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.upstage.ai/v1/solar',
    },
    sdkType: 'openai',
  },
  url: 'https://upstage.ai',
};

export default Upstage;
