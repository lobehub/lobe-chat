import { ModelProviderCard } from '@/types/llm';

// ref https://console.groq.com/docs/tool-use
const Groq: ModelProviderCard = {
  chatModels: [
    // TODO: During preview launch, Groq is limiting 3.1 models to max_tokens of 8k.
    {
      description:
        'Llama 3.1 8B 是一款高效能模型，提供了快速的文本生成能力，非常适合需要大规模效率和成本效益的应用场景。',
      displayName: 'Llama 3.1 8B (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama-3.1-8b-instant',
      maxOutput: 8192,
      pricing: {
        input: 0.05,
        output: 0.08,
      },
      tokens: 131_072,
    },
    {
      description:
        'Llama 3.1 70B 提供更强大的AI推理能力，适合复杂应用，支持超多的计算处理并保证高效和准确率。',
      displayName: 'Llama 3.1 70B (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama-3.1-70b-versatile',
      maxOutput: 8192,
      pricing: {
        input: 0.59,
        output: 0.79,
      },
      tokens: 131_072,
    },
    /*
    // Offline due to overwhelming demand! Stay tuned for updates.
    {
      displayName: 'Llama 3.1 405B (Preview)',
      functionCall: true,
      id: 'llama-3.1-405b-reasoning',
      tokens: 8_192,
    },
*/
    {
      description: 'Llama 3 Groq 8B Tool Use 是针对高效工具使用优化的模型，支持快速并行计算。',
      displayName: 'Llama 3 Groq 8B Tool Use (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama3-groq-8b-8192-tool-use-preview',
      pricing: {
        input: 0.19,
        output: 0.19,
      },
      tokens: 8192,
    },
    {
      description: 'Llama 3 Groq 70B Tool Use 提供强大的工具调用能力，支持复杂任务的高效处理。',
      displayName: 'Llama 3 Groq 70B Tool Use (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama3-groq-70b-8192-tool-use-preview',
      pricing: {
        input: 0.89,
        output: 0.89,
      },
      tokens: 8192,
    },
    {
      description: 'Meta Llama 3 8B 带来优质的推理效能，适合多场景应用需求。',
      displayName: 'Meta Llama 3 8B',
      functionCall: true,
      id: 'llama3-8b-8192',
      pricing: {
        input: 0.05,
        output: 0.08,
      },
      tokens: 8192,
    },
    {
      description: 'Meta Llama 3 70B 提供无与伦比的复杂性处理能力，为高要求项目量身定制。',
      displayName: 'Meta Llama 3 70B',
      functionCall: true,
      id: 'llama3-70b-8192',
      pricing: {
        input: 0.59,
        output: 0.79,
      },
      tokens: 8192,
    },
    {
      description: 'Gemma 2 9B 是一款优化用于特定任务和工具整合的模型。',
      displayName: 'Gemma 2 9B',
      enabled: true,
      functionCall: true,
      id: 'gemma2-9b-it',
      pricing: {
        input: 0.2,
        output: 0.2,
      },
      tokens: 8192,
    },
    {
      description: 'Gemma 7B 适合中小规模任务处理，兼具成本效益。',
      displayName: 'Gemma 7B',
      functionCall: true,
      id: 'gemma-7b-it',
      pricing: {
        input: 0.07,
        output: 0.07,
      },
      tokens: 8192,
    },
    {
      description: 'Mixtral 8x7B 提供高容错的并行计算能力，适合复杂任务。',
      displayName: 'Mixtral 8x7B',
      functionCall: true,
      id: 'mixtral-8x7b-32768',
      pricing: {
        input: 0.24,
        output: 0.24,
      },
      tokens: 32_768,
    },
    {
      description: 'LLaVA 1.5 7B 提供视觉处理能力融合，通过视觉信息输入生成复杂输出。',
      displayName: 'LLaVA 1.5 7B',
      enabled: true,
      id: 'llava-v1.5-7b-4096-preview',
      tokens: 4096,
      vision: true,
    },
  ],
  checkModel: 'gemma2-9b-it',
  description:
    'Groq 的 LPU 推理引擎在最新的独立大语言模型（LLM）基准测试中表现卓越，以其惊人的速度和效率重新定义了 AI 解决方案的标准。Groq 是一种即时推理速度的代表，在基于云的部署中展现了良好的性能。',
  id: 'groq',
  modelsUrl: 'https://console.groq.com/docs/models',
  name: 'Groq',
  proxyUrl: {
    placeholder: 'https://api.groq.com/openai/v1',
  },
  url: 'https://groq.com',
};

export default Groq;
