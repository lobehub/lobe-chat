import { ModelProviderCard } from '@/types/llm';

// ref https://api.together.xyz/models
const TogetherAI: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Deepseek Coder Instruct (33B)',
      enabled: true,
      functionCall: false,
      id: 'deepseek-ai/deepseek-coder-33b-instruct',
      tokens: 16_384,
      vision: false,
    },
    {
      displayName: 'Phind Code LLaMA v2 (34B)',
      enabled: true,
      functionCall: false,
      id: 'Phind/Phind-CodeLlama-34B-v2',
      tokens: 16_384,
      vision: false,
    },
    {
      displayName: 'Gemma Instruct (2B)',
      enabled: true,
      functionCall: false,
      id: 'google/gemma-2b-it',
      tokens: 8192,
      vision: false,
    },
    {
      displayName: 'LLaMA-2 Chat (13B)',
      enabled: true,
      functionCall: false,
      id: 'meta-llama/Llama-2-13b-chat-hf',
      tokens: 4096,
      vision: false,
    },
    {
      displayName: '01-ai Yi Chat (34B)',
      enabled: true,
      functionCall: false,
      id: 'zero-one-ai/Yi-34B-Chat',
      tokens: 4096,
      vision: false,
    },
    {
      displayName: 'Mixtral-8x7B Instruct (46.7B)',
      enabled: true,
      functionCall: false,
      id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      tokens: 32_768,
      vision: false,
    },
    {
      displayName: 'Nous Hermes 2 - Mixtral 8x7B-DPO (46.7B)',
      enabled: true,
      functionCall: false,
      id: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
      tokens: 32_768,
      vision: false,
    },
    {
      displayName: 'Nous Hermes-2 Yi (34B)',
      enabled: true,
      functionCall: false,
      id: 'NousResearch/Nous-Hermes-2-Yi-34B',
      tokens: 4096,
      vision: false,
    },
    {
      displayName: 'Qwen 1.5 Chat (7B)',
      enabled: true,
      functionCall: false,
      id: 'Qwen/Qwen1.5-7B-Chat',
      tokens: 32_768,
      vision: false,
    },
    {
      displayName: 'Qwen 1.5 Chat (14B)',
      enabled: true,
      functionCall: false,
      id: 'Qwen/Qwen1.5-14B-Chat',
      tokens: 32_768,
      vision: false,
    },
    {
      displayName: 'Qwen 1.5 Chat (72B)',
      enabled: true,
      functionCall: false,
      id: 'Qwen/Qwen1.5-72B-Chat',
      tokens: 32_768,
      vision: false,
    },
  ],
  id: 'togetherai',
};

export default TogetherAI;
