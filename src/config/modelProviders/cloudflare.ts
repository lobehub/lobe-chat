import { ModelProviderCard } from '@/types/llm';

// ref https://developers.cloudflare.com/workers-ai/models/#text-generation
// api https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility
const Cloudflare: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'LLaMA2-7B-chat',
      enabled: true,
    //   functionCall: true,
      id: '@cf/meta/llama-2-7b-chat-fp16',
      tokens: 3072,
    },
  ],
  checkModel: '@cf/meta/llama-2-7b-chat-fp16',
  id: 'cloudflare',
  name: 'Cloudflare',
};

export default Cloudflare;
