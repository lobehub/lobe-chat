import { ModelProviderCard } from '@/types/llm';

// ref https://docs.together.ai/docs/chat-models
// ref https://www.together.ai/pricing
const TogetherAI: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Llama 3.1 8B Instruct Turbo',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3.1 70B Instruct Turbo',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3.1 405B Instruct Turbo',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 8B Instruct Turbo',
      id: 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 70B Instruct Turbo',
      id: 'meta-llama/Meta-Llama-3-70B-Instruct-Turbo',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 8B Instruct Lite',
      id: 'meta-llama/Meta-Llama-3-8B-Instruct-Lite',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 70B Instruct Lite',
      id: 'meta-llama/Meta-Llama-3-70B-Instruct-Lite',
      tokens: 8192,
    },
    {
      displayName: 'LLaMA-3 Chat (8B)',
      id: 'meta-llama/Llama-3-8b-chat-hf',
      tokens: 8192,
    },
    {
      displayName: 'LLaMA-3 Chat (70B)',
      id: 'meta-llama/Llama-3-70b-chat-hf',
      tokens: 8192,
    },
    {
      displayName: 'LLaMA-2 Chat (13B)',
      id: 'meta-llama/Llama-2-13b-chat-hf',
      tokens: 4096,
    },
    {
      displayName: 'Gemma 2 9B',
      enabled: true,
      id: 'google/gemma-2-9b-it',
      tokens: 8192,
    },
    {
      displayName: 'Gemma 2 27B',
      enabled: true,
      id: 'google/gemma-2-27b-it',
      tokens: 8192,
    },
    {
      displayName: 'Gemma Instruct (2B)',
      id: 'google/gemma-2b-it',
      tokens: 8192,
    },
    {
      displayName: 'Mistral (7B) Instruct v0.3',
      enabled: true,
      id: 'mistralai/Mistral-7B-Instruct-v0.3',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral (7B) Instruct v0.2',
      id: 'mistralai/Mistral-7B-Instruct-v0.2',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral (7B) Instruct',
      id: 'mistralai/Mistral-7B-Instruct-v0.1',
      tokens: 8192,
    },
    {
      displayName: 'Mixtral-8x7B Instruct (46.7B)',
      enabled: true,
      id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      tokens: 32_768,
    },
    {
      displayName: 'Mixtral-8x22B Instruct (141B)',
      enabled: true,
      id: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
      tokens: 65_536,
    },
    {
      displayName: 'DeepSeek LLM Chat (67B)',
      enabled: true,
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      tokens: 4096,
    },
    {
      displayName: 'Qwen 2 Instruct (72B)',
      enabled: true,
      id: 'Qwen/Qwen2-72B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen 1.5 Chat (72B)',
      id: 'Qwen/Qwen1.5-72B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen 1.5 Chat (110B)',
      id: 'Qwen/Qwen1.5-110B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'DBRX Instruct',
      id: 'databricks/dbrx-instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Upstage SOLAR Instruct v1 (11B)',
      id: 'upstage/SOLAR-10.7B-Instruct-v1.0',
      tokens: 4096,
    },
    {
      displayName: 'Nous Hermes 2 - Mixtral 8x7B-DPO (46.7B)',
      id: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
      tokens: 32_768,
    },
    {
      displayName: 'Nous Hermes-2 Yi (34B)',
      id: 'NousResearch/Nous-Hermes-2-Yi-34B',
      tokens: 4096,
    },
    {
      displayName: 'MythoMax-L2 (13B)',
      id: 'Gryphe/MythoMax-L2-13b',
      tokens: 4096,
    },
    {
      displayName: 'StripedHyena Nous (7B)',
      id: 'togethercomputer/StripedHyena-Nous-7B',
      tokens: 32_768,
    },
  ],
  checkModel: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  id: 'togetherai',
  modelList: { showModelFetcher: true },
  name: 'Together AI',
};

export default TogetherAI;
