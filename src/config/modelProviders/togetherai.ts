import { ModelProviderCard } from '@/types/llm';

// ref https://docs.together.ai/docs/inference-models
const TogetherAI: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Deepseek Coder Instruct (33B)',
      enabled: true,
      id: 'deepseek-ai/deepseek-coder-33b-instruct',
      tokens: 16_384,
    },
    {
      displayName: 'Phind Code LLaMA v2 (34B)',
      enabled: true,
      id: 'Phind/Phind-CodeLlama-34B-v2',
      tokens: 16_384,
    },
    {
      displayName: 'Gemma Instruct (2B)',
      enabled: true,
      id: 'google/gemma-2b-it',
      tokens: 8192,
    },
    {
      displayName: 'LLaMA-2 Chat (13B)',
      enabled: true,
      id: 'meta-llama/Llama-2-13b-chat-hf',
      tokens: 4096,
    },
    {
      displayName: '01-ai Yi Chat (34B)',
      enabled: true,
      id: 'zero-one-ai/Yi-34B-Chat',
      tokens: 4096,
    },
    {
      displayName: 'Mixtral-8x7B Instruct (46.7B)',
      enabled: true,
      id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      tokens: 32_768,
    },
    {
      displayName: 'Nous Hermes 2 - Mixtral 8x7B-DPO (46.7B)',
      enabled: true,
      id: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
      tokens: 32_768,
    },
    {
      displayName: 'Nous Hermes-2 Yi (34B)',
      enabled: true,
      id: 'NousResearch/Nous-Hermes-2-Yi-34B',
      tokens: 4096,
    },
    {
      displayName: 'Qwen 1.5 Chat (7B)',
      enabled: true,
      id: 'Qwen/Qwen1.5-7B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen 1.5 Chat (32B)',
      enabled: true,
      id: 'Qwen/Qwen1.5-32B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen 1.5 Chat (72B)',
      enabled: true,
      id: 'Qwen/Qwen1.5-72B-Chat',
      tokens: 32_768,
    },
  ],
  checkModel: 'togethercomputer/alpaca-7b',
  id: 'togetherai',
  modelList: { showModelFetcher: true },
  name: 'Together AI',
};

export default TogetherAI;
