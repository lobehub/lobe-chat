import { AIChatModelCard } from '@/types/aiModel';

const cohereChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 256_000,
    description: 'Command A is our most performant model to date, excelling at tool use, agents, retrieval augmented generation (RAG), and multilingual use cases. Command A has a context length of 256K, only requires two GPUs to run, and has 150% higher throughput compared to Command R+ 08-2024.',
    displayName: 'Command A',
    enabled: true,
    id: 'command-a-03-2025',
    maxOutput: 8000,
    pricing: {
      input: 2.5,
      output: 10
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'command-r-plus is an alias for command-r-plus-04-2024, so if you use command-r-plus in the API, that’s the model you’re pointing to.',
    displayName: 'Command R+',
    enabled: true,
    id: 'command-r-plus',
    maxOutput: 4000,
    pricing: {
      input: 2.5,
      output: 10
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Command R+ is an instruction-following conversational model that performs language tasks at a higher quality, more reliably, and with a longer context than previous models. It is best suited for complex RAG workflows and multi-step tool use.',
    displayName: 'Command R+ 04-2024',
    id: 'command-r-plus-04-2024',
    maxOutput: 4000,
    pricing: {
      input: 3,
      output: 15
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'command-r is an alias for command-r-03-2024, so if you use command-r in the API, that’s the model you’re pointing to.',
    displayName: 'Command R',
    enabled: true,
    id: 'command-r',
    maxOutput: 4000,
    pricing: {
      input: 0.15,
      output: 0.6
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'command-r-08-2024 is an update of the Command R model, delivered in August 2024.',
    displayName: 'Command R 08-2024',
    id: 'command-r-08-2024',
    maxOutput: 4000,
    pricing: {
      input: 0.15,
      output: 0.6
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Command R is an instruction-following conversational model that performs language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.',
    displayName: 'Command R 03-2024',
    id: 'command-r-03-2024',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'command-r7b-12-2024 is a small, fast update delivered in December 2024. It excels at RAG, tool use, agents, and similar tasks requiring complex reasoning and multiple steps.',
    displayName: 'Command R7B 12-2024',
    enabled: true,
    id: 'command-r7b-12-2024',
    maxOutput: 4000,
    pricing: {
      input: 0.0375,
      output: 0.15
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 4000,
    description: 'An instruction-following conversational model that performs language tasks with high quality, more reliably and with a longer context than our base generative models.',
    displayName: 'Command',
    enabled: true,
    id: 'command',
    maxOutput: 4000,
    pricing: {
      input: 1,
      output: 2
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'To reduce the time between major releases, we put out nightly versions of command models. For command, that is command-nightly. Be advised that command-nightly is the latest, most experimental, and (possibly) unstable version of its default counterpart. Nightly releases are updated regularly, without warning, and are not recommended for production use.',
    displayName: 'Command Nightly',
    id: 'command-nightly',
    maxOutput: 4000,
    pricing: {
      input: 1,
      output: 2
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 4000,
    description: 'A smaller, faster version of command. Almost as capable, but a lot faster.',
    displayName: 'Command Light',
    enabled: true,
    id: 'command-light',
    maxOutput: 4000,
    pricing: {
      input: 0.3,
      output: 0.6
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 4000,
    description: 'To reduce the time between major releases, we put out nightly versions of command models. For command-light, that is command-light-nightly. Be advised that command-light-nightly is the latest, most experimental, and (possibly) unstable version of its default counterpart. Nightly releases are updated regularly, without warning, and are not recommended for production use.',
    displayName: 'Command Light Nightly',
    id: 'command-light-nightly',
    maxOutput: 4000,
    pricing: {
      input: 0.3,
      output: 0.6
    },
    type: 'chat'
  },
  {
    contextWindowTokens: 128_000,
    description: 'Aya Expanse is a highly performant 32B multilingual model, designed to rival monolingual performance through innovations in instruction tuning with data arbitrage, preference training, and model merging. Serves 23 languages.',
    displayName: 'Aya Expanse 32B',
    enabled: true,
    id: 'c4ai-aya-expanse-32b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    contextWindowTokens: 8000,
    description: 'Aya Expanse is a highly performant 8B multilingual model, designed to rival monolingual performance through innovations in instruction tuning with data arbitrage, preference training, and model merging. Serves 23 languages.',
    displayName: 'Aya Expanse 8B',
    enabled: true,
    id: 'c4ai-aya-expanse-8b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_000,
    description: 'Aya Vision is a state-of-the-art multimodal model excelling at a variety of critical benchmarks for language, text, and image capabilities. Serves 23 languages. This 32 billion parameter variant is focused on state-of-art multilingual performance.',
    displayName: 'Aya Vision 32B',
    enabled: true,
    id: 'c4ai-aya-vision-32b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_000,
    description: 'Aya Vision is a state-of-the-art multimodal model excelling at a variety of critical benchmarks for language, text, and image capabilities. This 8 billion parameter variant is focused on low latency and best-in-class performance.',
    displayName: 'Aya Vision 8B',
    enabled: true,
    id: 'c4ai-aya-vision-8b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
]

export const allModels = [...cohereChatModels];

export default allModels;
