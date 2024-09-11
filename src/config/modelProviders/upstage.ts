import { ModelProviderCard } from '@/types/llm';

// ref https://developers.upstage.ai/docs/getting-started/models
const Upstage: ModelProviderCard = {
  chatModels: [
    {
      description: 'A more intelligent, instruction-following Solar LLM with IFEval 80+. The official version with expanded language support and longer context length will be released in November 2024. solar-pro supports English only at this time. solar-pro is an alias for our latest Solar Pro model. (Currently solar-pro-preview-240910)',
      displayName: 'Solar Pro',
      enabled: true,
      functionCall: false,
      id: 'solar-pro',
      tokens: 4096,
    },
    {
      description: 'A compact LLM offering superior performance to GPT-3.5, with robust multilingual capabilities for both English and Korean, delivering high efficiency in a smaller package. solar-1-mini-chat is alias for our latest solar-1-mini-chat model. (Currently solar-1-mini-chat-240612)',
      displayName: 'Solar Mini',
      enabled: true,
      functionCall: true,
      id: 'solar-1-mini-chat',
      tokens: 32_768,
    },
    {
      description: 'A compact LLM that extends the capabilities of solar-mini-chat with specialization in Japanese, while maintaining high efficiency and performance in English and Korean. solar-1-mini-chat-ja is alias for our latest solar-1-mini-chat-ja model.(Currently solar-1-mini-chat-ja-240612)',
      displayName: 'Solar Mini (Ja)',
      functionCall: false,
      id: 'solar-1-mini-chat-ja',
      tokens: 32_768,
    },
  ],
  checkModel: 'solar-1-mini-chat',
  id: 'upstage',
  modelList: { showModelFetcher: true },
  name: 'Upstage',
};

export default Upstage;
