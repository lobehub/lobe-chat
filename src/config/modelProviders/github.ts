import { ModelProviderCard } from '@/types/llm';

// ref:
// https://github.com/marketplace/models
const Github: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 200_000,
      description:
        '专注于高级推理和解决复杂问题，包括数学和科学任务。非常适合需要深入上下文理解和代理工作流程的应用程序。',
      displayName: 'OpenAI o1',
      enabled: true,
      functionCall: false,
      id: 'o1',
      maxOutput: 100_000,
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description: '比 o1-preview 更小、更快，成本低80%，在代码生成和小上下文操作方面表现良好。',
      displayName: 'OpenAI o1-mini',
      enabled: true,
      functionCall: false,
      id: 'o1-mini',
      maxOutput: 65_536,
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        '专注于高级推理和解决复杂问题，包括数学和科学任务。非常适合需要深度上下文理解和自主工作流程的应用。',
      displayName: 'OpenAI o1-preview',
      enabled: true,
      functionCall: false,
      id: 'o1-preview',
      maxOutput: 32_768,
      vision: true,
    },
    {
      contextWindowTokens: 134_144,
      description: '一种经济高效的AI解决方案，适用于多种文本和图像任务。',
      displayName: 'OpenAI GPT-4o mini',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-mini',
      maxOutput: 4096,
      vision: true,
    },
    {
      contextWindowTokens: 134_144,
      description: 'OpenAI GPT-4系列中最先进的多模态模型，可以处理文本和图像输入。',
      displayName: 'OpenAI GPT-4o',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o',
      maxOutput: 16_384,
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'DeepSeek R1',
      id: 'DeepSeek-R1',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 262_144,
      description:
        '一个52B参数（12B活跃）的多语言模型，提供256K长上下文窗口、函数调用、结构化输出和基于事实的生成。',
      displayName: 'AI21 Jamba 1.5 Mini',
      functionCall: true,
      id: 'ai21-jamba-1.5-mini',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 262_144,
      description:
        '一个398B参数（94B活跃）的多语言模型，提供256K长上下文窗口、函数调用、结构化输出和基于事实的生成。',
      displayName: 'AI21 Jamba 1.5 Large',
      functionCall: true,
      id: 'ai21-jamba-1.5-large',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Command R是一个可扩展的生成模型，旨在针对RAG和工具使用，使企业能够实现生产级AI。',
      displayName: 'Cohere Command R',
      id: 'cohere-command-r',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: 'Command R+是一个最先进的RAG优化模型，旨在应对企业级工作负载。',
      displayName: 'Cohere Command R+',
      id: 'cohere-command-r-plus',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Mistral Nemo是一种尖端的语言模型（LLM），在其尺寸类别中拥有最先进的推理、世界知识和编码能力。',
      displayName: 'Mistral Nemo',
      id: 'mistral-nemo',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: 'Mistral Small可用于任何需要高效率和低延迟的基于语言的任务。',
      displayName: 'Mistral Small',
      id: 'mistral-small',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Mistral的旗舰模型，适合需要大规模推理能力或高度专业化的复杂任务（合成文本生成、代码生成、RAG或代理）。',
      displayName: 'Mistral Large',
      id: 'mistral-large',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 262_144,
      displayName: 'Codestral',
      id: 'Codestral-2501',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: '在高分辨率图像上表现出色的图像推理能力，适用于视觉理解应用。',
      displayName: 'Llama 3.2 11B Vision',
      id: 'llama-3.2-11b-vision-instruct',
      maxOutput: 4096,
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description: '适用于视觉理解代理应用的高级图像推理能力。',
      displayName: 'Llama 3.2 90B Vision',
      id: 'llama-3.2-90b-vision-instruct',
      maxOutput: 4096,
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
      displayName: 'Meta Llama 3.1 8B',
      id: 'meta-llama-3.1-8b-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
      displayName: 'Meta Llama 3.1 70B',
      id: 'meta-llama-3.1-70b-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
      displayName: 'Meta Llama 3.1 405B',
      id: 'meta-llama-3.1-405b-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 8192,
      description: '一个多功能的80亿参数模型，针对对话和文本生成任务进行了优化。',
      displayName: 'Meta Llama 3 8B',
      id: 'meta-llama-3-8b-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 8192,
      description: '一个强大的700亿参数模型，在推理、编码和广泛的语言应用方面表现出色。',
      displayName: 'Meta Llama 3 70B',
      id: 'meta-llama-3-70b-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 16_384,
      displayName: 'Phi 4',
      id: 'Phi-4',
      maxOutput: 16_384,
    },
    {
      contextWindowTokens: 131_072,
      displayName: 'Phi 3.5 MoE',
      id: 'Phi-3.5-MoE-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: 'Phi-3-mini模型的更新版。',
      displayName: 'Phi-3.5-mini 128K',
      id: 'Phi-3.5-mini-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: 'Phi-3-vision模型的更新版。',
      displayName: 'Phi-3.5-vision 128K',
      id: 'Phi-3.5-vision-instrust',
      maxOutput: 4096,
      vision: true,
    },
    {
      contextWindowTokens: 4096,
      description: 'Phi-3家族中最小的成员，针对质量和低延迟进行了优化。',
      displayName: 'Phi-3-mini 4K',
      id: 'Phi-3-mini-4k-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: '相同的Phi-3-mini模型，但具有更大的上下文大小，适用于RAG或少量提示。',
      displayName: 'Phi-3-mini 128K',
      id: 'Phi-3-mini-128k-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 8192,
      description: '一个70亿参数模型，质量优于Phi-3-mini，重点关注高质量、推理密集型数据。',
      displayName: 'Phi-3-small 8K',
      id: 'Phi-3-small-8k-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: '相同的Phi-3-small模型，但具有更大的上下文大小，适用于RAG或少量提示。',
      displayName: 'Phi-3-small 128K',
      id: 'Phi-3-small-128k-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 4096,
      description: '一个140亿参数模型，质量优于Phi-3-mini，重点关注高质量、推理密集型数据。',
      displayName: 'Phi-3-medium 4K',
      id: 'Phi-3-medium-4k-instruct',
      maxOutput: 4096,
    },
    {
      contextWindowTokens: 131_072,
      description: '相同的Phi-3-medium模型，但具有更大的上下文大小，适用于RAG或少量提示。',
      displayName: 'Phi-3-medium 128K',
      id: 'Phi-3-medium-128k-instruct',
      maxOutput: 4096,
    },
  ],
  checkModel: 'Phi-3-mini-4k-instruct',
  // Ref: https://github.blog/news-insights/product-news/introducing-github-models/
  description: '通过GitHub模型，开发人员可以成为AI工程师，并使用行业领先的AI模型进行构建。',
  id: 'github',
  modelList: { showModelFetcher: true },
  // I'm not sure if it is good to show the model fetcher, as remote list is not complete.
  name: 'GitHub',
  settings: {
    sdkType: 'azure',
    showModelFetcher: true,
  },
  url: 'https://github.com/marketplace/models',
};

export default Github;
