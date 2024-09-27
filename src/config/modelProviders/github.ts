import { ModelProviderCard } from '@/types/llm';

// ref:
// https://github.com/marketplace/models
const Github: ModelProviderCard = {
  chatModels: [
    {
      description:
        'A 398B parameters (94B active) multilingual model, offering a 256K long context window, function calling, structured output, and grounded generation.',
      displayName: 'AI21 Jamba 1.5 Large',
      functionCall: true,
      id: 'ai21-jamba-1.5-large',
      maxOutput: 4096,
      tokens: 262_144,
    },
    {
      description:
        'A 52B parameters (12B active) multilingual model, offering a 256K long context window, function calling, structured output, and grounded generation.',
      displayName: 'AI21 Jamba 1.5 Mini',
      functionCall: true,
      id: 'ai21-jamba-1.5-mini',
      maxOutput: 4096,
      tokens: 262_144,
    },
    {
      description:
        'A production-grade Mamba-based LLM model to achieve best-in-class performance, quality, and cost efficiency.',
      displayName: 'AI21-Jamba-Instruct',
      id: 'ai21-jamba-instruct',
      maxOutput: 4096,
      tokens: 72_000,
    },
    {
      description:
        'Command R is a scalable generative model targeting RAG and Tool Use to enable production-scale AI for enterprise.',
      displayName: 'Cohere Command R',
      id: 'cohere-command-r',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'Command R+ is a state-of-the-art RAG-optimized model designed to tackle enterprise-grade workloads.',
      displayName: 'Cohere Command R+',
      id: 'cohere-command-r-plus',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'A powerful 70-billion parameter model excelling in reasoning, coding, and broad language applications.',
      displayName: 'Meta-Llama-3-70B-Instruct',
      id: 'meta-llama-3-70b-instruct',
      maxOutput: 4096,
      tokens: 8192,
    },
    {
      description:
        'A versatile 8-billion parameter model optimized for dialogue and text generation tasks.',
      displayName: 'Meta-Llama-3-8B-Instruct',
      id: 'meta-llama-3-8b-instruct',
      maxOutput: 4096,
      tokens: 8192,
    },
    {
      description:
        'The Llama 3.1 instruction tuned text only models are optimized for multilingual dialogue use cases and outperform many of the available open source and closed chat models on common industry benchmarks.',
      displayName: 'Meta-Llama-3.1-405B-Instruct',
      id: 'meta-llama-3.1-405b-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'The Llama 3.1 instruction tuned text only models are optimized for multilingual dialogue use cases and outperform many of the available open source and closed chat models on common industry benchmarks.',
      displayName: 'Meta-Llama-3.1-70B-Instruct',
      id: 'meta-llama-3.1-70b-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'The Llama 3.1 instruction tuned text only models are optimized for multilingual dialogue use cases and outperform many of the available open source and closed chat models on common industry benchmarks.',
      displayName: 'Meta-Llama-3.1-8B-Instruct',
      id: 'meta-llama-3.1-8b-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        "Mistral's flagship model that's ideal for complex tasks that require large reasoning capabilities or are highly specialized (Synthetic Text Generation, Code Generation, RAG, or Agents).",
      displayName: 'Mistral Large',
      id: 'mistral-large',
      maxOutput: 4096,
      tokens: 33_000,
    },
    {
      description:
        'Mistral Large (2407) is an advanced Large Language Model (LLM) with state-of-the-art reasoning, knowledge and coding capabilities.',
      displayName: 'Mistral Large (2407)',
      id: 'mistral-large-2407',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'Mistral Nemo is a cutting-edge Language Model (LLM) boasting state-of-the-art reasoning, world knowledge, and coding capabilities within its size category.',
      displayName: 'Mistral Nemo',
      id: 'mistral-nemo',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'Mistral Small can be used on any language-based task that requires high efficiency and low latency.',
      displayName: 'Mistral Small',
      id: 'mistral-small',
      maxOutput: 4096,
      tokens: 33_000,
    },
    {
      description:
        "OpenAI's most advanced multimodal model in the GPT-4 family. Can handle both text and image inputs.",
      displayName: 'OpenAI GPT-4o',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o',
      maxOutput: 4096,
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'An affordable, efficient AI solution for diverse text and image tasks.',
      displayName: 'OpenAI GPT-4o mini',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-mini',
      maxOutput: 4096,
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Focused on advanced reasoning and solving complex problems, including math and science tasks. Ideal for applications that require deep contextual understanding and agentic workflows.',
      displayName: 'OpenAI o1-preview',
      enabled: true,
      functionCall: false,
      id: 'o1-preview',
      maxOutput: 32_768,
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Smaller, faster, and 80% cheaper than o1-preview, performs well at code generation and small context operations.',
      displayName: 'OpenAI o1-mini',
      enabled: true,
      functionCall: false,
      id: 'o1-mini',
      maxOutput: 65_536,
      tokens: 128_000,
      vision: true,
    },
    {
      description:
        'Same Phi-3-medium model, but with a larger context size for RAG or few shot prompting.',
      displayName: 'Phi-3-medium instruct (128k)',
      id: 'Phi-3-medium-128k-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'A 14B parameters model, proves better quality than Phi-3-mini, with a focus on high-quality, reasoning-dense data.',
      displayName: 'Phi-3-medium instruct (4k)',
      id: 'Phi-3-medium-4k-instruct',
      maxOutput: 4096,
      tokens: 4096,
    },
    {
      description:
        'Same Phi-3-mini model, but with a larger context size for RAG or few shot prompting.',
      displayName: 'Phi-3-mini instruct (128k)',
      id: 'Phi-3-mini-128k-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'Tiniest member of the Phi-3 family. Optimized for both quality and low latency.',
      displayName: 'Phi-3-mini instruct (4k)',
      id: 'Phi-3-mini-4k-instruct',
      maxOutput: 4096,
      tokens: 4096,
    },
    {
      description:
        'Same Phi-3-small model, but with a larger context size for RAG or few shot prompting.',
      displayName: 'Phi-3-small instruct (128k)',
      id: 'Phi-3-small-128k-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description:
        'A 7B parameters model, proves better quality than Phi-3-mini, with a focus on high-quality, reasoning-dense data.',
      displayName: 'Phi-3-small instruct (8k)',
      id: 'Phi-3-small-8k-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
    {
      description: 'Refresh of Phi-3-mini model.',
      displayName: 'Phi-3.5-mini instruct (128k)',
      id: 'Phi-3-5-mini-instruct',
      maxOutput: 4096,
      tokens: 131_072,
    },
  ],
  checkModel: 'Phi-3-mini-4k-instruct',
  // Ref: https://github.blog/news-insights/product-news/introducing-github-models/
  description:
    "With GitHub Models, developers can become AI engineers and build with the industry's leading AI models.",
  enabled: true,
  id: 'github',
  modelList: { showModelFetcher: true },
  name: 'GitHub',
  url: 'https://github.com/marketplace/models',
};

export default Github;
