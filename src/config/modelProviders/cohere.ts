import { ModelProviderCard } from '@/types/llm';

// ref https://cohere.com/command
const Cohere: ModelProviderCard = {
  chatModels: [
    {
      description:
        'An instruction-following conversational model that performs language tasks at a higher quality, more reliably, and with a longer context than previous models. Best suited for complex RAG workflows and multi-step tool use.',
      displayName: 'Command R+',
      enabled: true,
      functionCall: true,
      id: 'command-r-plus',
      maxOutput: 4096,
      tokens: 128_000,
      vision: false,
    },
    {
      description:
        'An instruction-following conversational model that performs language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.',
      displayName: 'Command R',
      enabled: true,
      functionCall: true,
      id: 'command-r',
      maxOutput: 4096,
      tokens: 128_000,
      vision: false,
    }
  ], // TODO: what about embed models? I only see chatModels on other modelProviders
  id: 'cohere',
  name: 'Cohere',
};

export default Cohere;
