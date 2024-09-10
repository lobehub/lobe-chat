import { ModelProviderCard } from '@/types/llm';

// ref https://fireworks.ai/models?show=Serverless
// ref https://fireworks.ai/pricing
const FireworksAI: ModelProviderCard = {
  chatModels: [
    {
      description: 'Fireworks latest and most performant function-calling model. Firefunction-v2 is based on Llama-3 and trained to excel at function-calling as well as chat and instruction-following. See blog post for more details https://fireworks.ai/blog/firefunction-v2-launch-post',
      displayName: 'Firefunction V2',
      enabled: true,
      functionCall: true,
      id: 'accounts/fireworks/models/firefunction-v2',
      tokens: 8192,
    },
    {
      description: 'Fireworks open-source function calling model.',
      displayName: 'Firefunction V1',
      functionCall: true,
      id: 'accounts/fireworks/models/firefunction-v1',
      tokens: 32_768,
    },
    {
      description: 'Vision-language model allowing both image and text as inputs (single image is recommended), trained on OSS model generated training data and open sourced on huggingface at fireworks-ai/FireLLaVA-13b',
      displayName: 'FireLLaVA-13B',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/firellava-13b',
      tokens: 4096,
      vision: true,
    },
    {
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3.1 405B Instruct',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/llama-v3p1-405b-instruct',
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3 8B Instruct',
      functionCall: false,
      id: 'accounts/fireworks/models/llama-v3-8b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 70B Instruct',
      functionCall: false,
      id: 'accounts/fireworks/models/llama-v3-70b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 8B Instruct (HF version)',
      functionCall: false,
      id: 'accounts/fireworks/models/llama-v3-8b-instruct-hf',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 70B Instruct (HF version)',
      functionCall: false,
      id: 'accounts/fireworks/models/llama-v3-70b-instruct-hf',
      tokens: 8192,
    },
    {
      displayName: 'Gemma 2 9B Instruct',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/gemma2-9b-it',
      tokens: 8192,
    },
    {
      displayName: 'Mixtral MoE 8x7B Instruct',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/mixtral-8x7b-instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Mixtral MoE 8x22B Instruct',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/mixtral-8x22b-instruct',
      tokens: 65_536,
    },
    {
      displayName: 'Mixtral MoE 8x7B Instruct (HF version)',
      functionCall: false,
      id: 'accounts/fireworks/models/mixtral-8x7b-instruct-hf',
      tokens: 32_768,
    },
    {
      displayName: 'Phi 3 Vision Instruct',
      enabled: true,
      functionCall: false,
      id: 'accounts/fireworks/models/phi-3-vision-128k-instruct',
      tokens: 8192,
      vision: true,
    },
    {
      displayName: 'Yi-Large',
      enabled: true,
      functionCall: false,
      id: 'accounts/yi-01-ai/models/yi-large',
      tokens: 32_768,
    },
    {
      displayName: 'StarCoder 7B',
      functionCall: false,
      id: 'accounts/fireworks/models/starcoder-7b',
      tokens: 8192,
    },
    {
      displayName: 'StarCoder 15.5B',
      functionCall: false,
      id: 'accounts/fireworks/models/starcoder-16b',
      tokens: 8192,
    },
    {
      displayName: 'MythoMax L2 13b',
      functionCall: false,
      id: 'accounts/fireworks/models/mythomax-l2-13b',
      tokens: 4096,
    },
  ],
  checkModel: 'accounts/fireworks/models/firefunction-v2',
  id: 'fireworksai',
  modelList: { showModelFetcher: true },
  name: 'Fireworks AI',
};

export default FireworksAI;
