import { ModelProviderCard } from '@/types/llm';

// ref https://developers.cloudflare.com/workers-ai/models/#text-generation
// api https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility
const Cloudflare: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'deepseek-coder-6.7b-instruct-awq',
      enabled: true,
      id: '@hf/thebloke/deepseek-coder-6.7b-instruct-awq',
      tokens: 16_384,
    },
    {
      displayName: 'gemma-7b-it',
      enabled: true,
      id: '@hf/google/gemma-7b-it',
      tokens: 2048,
    },
    {
      displayName: 'hermes-2-pro-mistral-7b',
      enabled: true,
      // functionCall: true,
      id: '@hf/nousresearch/hermes-2-pro-mistral-7b',
      tokens: 4096,
    },
    {
      displayName: 'llama-3-8b-instruct-awq',
      id: '@cf/meta/llama-3-8b-instruct-awq',
      tokens: 8192,
    },
    {
      displayName: 'mistral-7b-instruct-v0.2',
      id: '@hf/mistral/mistral-7b-instruct-v0.2',
      tokens: 4096,
    },
    {
      displayName: 'neural-chat-7b-v3-1-awq',
      enabled: true,
      id: '@hf/thebloke/neural-chat-7b-v3-1-awq',
      tokens: 32_768,
    },
    {
      displayName: 'openchat-3.5-0106',
      id: '@cf/openchat/openchat-3.5-0106',
      tokens: 8192,
    },
    {
      displayName: 'openhermes-2.5-mistral-7b-awq',
      enabled: true,
      id: '@hf/thebloke/openhermes-2.5-mistral-7b-awq',
      tokens: 32_768,
    },
    {
      displayName: 'qwen1.5-14b-chat-awq',
      enabled: true,
      id: '@cf/qwen/qwen1.5-14b-chat-awq',
      tokens: 32_768,
    },
    {
      displayName: 'starling-lm-7b-beta',
      enabled: true,
      id: '@hf/nexusflow/starling-lm-7b-beta',
      tokens: 4096,
    },
    {
      displayName: 'zephyr-7b-beta-awq',
      enabled: true,
      id: '@hf/thebloke/zephyr-7b-beta-awq',
      tokens: 32_768,
    },
    {
      description:
        'Generation over generation, Meta Llama 3 demonstrates state-of-the-art performance on a wide range of industry benchmarks and offers new capabilities, including improved reasoning.\t',
      displayName: 'meta-llama-3-8b-instruct',
      enabled: true,
      functionCall: false,
      id: '@hf/meta-llama/meta-llama-3-8b-instruct',
    },
  ],
  checkModel: '@hf/meta-llama/meta-llama-3-8b-instruct',
  id: 'cloudflare',
  modelList: {
    showModelFetcher: true,
  },
  name: 'Cloudflare Workers AI',
  url: 'https://developers.cloudflare.com/workers-ai/models',
};

export default Cloudflare;
