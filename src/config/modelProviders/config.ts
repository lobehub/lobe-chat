import { ModelProviderCard } from '@/types/llm';

// ref https://docs.cohere.com/docs/models
const Cohere: ModelProviderCard = {
  chatModels: [
    {
      description:
        'An instruction-following conversational model that performs language tasks with high quality, more reliably, and with a longer context length.',
      displayName: 'Command',
      enabled: true,
      functionCall: true,
      id: 'command',
      maxOutput: 4096,
      tokens: 4096, // No specific token limit mentioned, using context length as a reference
      vision: false, // No vision capabilities mentioned
    },
    {
      description:
        'Command R is an instruction-following conversational model that performs language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows.',
      displayName: 'Command R',
      enabled: true,
      functionCall: true,
      id: 'command-r',
      maxOutput: 4096,
      tokens: 128_000,
      vision: false,
    },
    {
      description:
        'Command R+ is an enhanced version of Command R, offering even higher quality, reliability, and context length. It is ideal for complex RAG workflows and multi-step tool use.',
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
        'A smaller, faster version of Command. Almost as capable, but with improved response time.',
      displayName: 'Command Light',
      enabled: true,
      functionCall: true,
      id: 'command-light',
      maxOutput: 4096,
      tokens: 4096,
      vision: false,
    },
  ],
  id: 'cohere',
};

export default Cohere;
