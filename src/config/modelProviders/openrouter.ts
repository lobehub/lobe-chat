import { ModelProviderCard } from '@/types/llm';

// ref :https://openrouter.ai/docs#models
const OpenRouter: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 128_000,
      description:
        '根据上下文长度、主题和复杂性，你的请求将发送到 Llama 3 70B Instruct、Claude 3.5 Sonnet（自我调节）或 GPT-4o。',
      displayName: 'Auto (best for prompt)',
      enabled: true,
      functionCall: false,
      id: 'openrouter/auto',
      vision: false,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
      displayName: 'OpenAI o1-mini',
      enabled: true,
      id: 'openai/o1-mini',
      maxOutput: 65_536,
      pricing: {
        input: 3,
        output: 12,
      },
      releasedAt: '2024-09-12',
    },
    {
      contextWindowTokens: 200_000,
      description:
        'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
      displayName: 'OpenAI o1',
      enabled: true,
      id: 'openai/o1',
      maxOutput: 100_000,
      pricing: {
        input: 15,
        output: 60,
      },
      releasedAt: '2024-12-17',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
      displayName: 'OpenAI o1-preview',
      enabled: true,
      id: 'openai/o1-preview',
      maxOutput: 32_768,
      pricing: {
        input: 15,
        output: 60,
      },
      releasedAt: '2024-09-12',
    },
    {
      contextWindowTokens: 128_000,
      description:
        'GPT-4o mini是OpenAI在GPT-4 Omni之后推出的最新模型，支持图文输入并输出文本。作为他们最先进的小型模型，它比其他近期的前沿模型便宜很多，并且比GPT-3.5 Turbo便宜超过60%。它保持了最先进的智能，同时具有显著的性价比。GPT-4o mini在MMLU测试中获得了 82% 的得分，目前在聊天偏好上排名高于 GPT-4。',
      displayName: 'GPT-4o mini',
      enabled: true,
      functionCall: true,
      id: 'openai/gpt-4o-mini',
      maxOutput: 16_385,
      pricing: {
        input: 0.15,
        output: 0.6,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
      displayName: 'GPT-4o',
      enabled: true,
      functionCall: true,
      id: 'openai/gpt-4o',
      pricing: {
        input: 2.5,
        output: 10,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3 Haiku 是 Anthropic 的最快且最紧凑的模型，旨在实现近乎即时的响应。它具有快速且准确的定向性能。',
      displayName: 'Claude 3 Haiku',
      enabled: true,
      functionCall: true,
      id: 'anthropic/claude-3-haiku',
      maxOutput: 4096,
      pricing: {
        cachedInput: 0.025,
        input: 0.25,
        output: 1.25,
        writeCacheInput: 0.3125,
      },
      releasedAt: '2024-03-07',
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3.5 Haiku 是 Anthropic 最快的下一代模型。与 Claude 3 Haiku 相比，Claude 3.5 Haiku 在各项技能上都有所提升，并在许多智力基准测试中超越了上一代最大的模型 Claude 3 Opus。',
      displayName: 'Claude 3.5 Haiku',
      enabled: true,
      functionCall: true,
      id: 'anthropic/claude-3.5-haiku',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.1,
        input: 1,
        output: 5,
        writeCacheInput: 1.25,
      },
      releasedAt: '2024-11-05',
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3.5 Sonnet 提供了超越 Opus 的能力和比 Sonnet 更快的速度，同时保持与 Sonnet 相同的价格。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
      displayName: 'Claude 3.5 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic/claude-3.5-sonnet',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.3,
        input: 3,
        output: 15,
        writeCacheInput: 3.75,
      },
      releasedAt: '2024-06-20',
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3 Opus 是 Anthropic 用于处理高度复杂任务的最强大模型。它在性能、智能、流畅性和理解力方面表现卓越。',
      displayName: 'Claude 3 Opus',
      enabled: true,
      functionCall: true,
      id: 'anthropic/claude-3-opus',
      maxOutput: 4096,
      pricing: {
        cachedInput: 1.5,
        input: 15,
        output: 75,
        writeCacheInput: 18.75,
      },
      releasedAt: '2024-02-29',
      vision: true,
    },
    {
      contextWindowTokens: 1_000_000 + 8192,
      description: 'Gemini 1.5 Flash 提供了优化后的多模态处理能力，适用多种复杂任务场景。',
      displayName: 'Gemini 1.5 Flash',
      enabled: true,
      functionCall: true,
      id: 'google/gemini-flash-1.5',
      maxOutput: 8192,
      pricing: {
        input: 0.075,
        output: 0.3,
      },
      vision: true,
    },
    {
      contextWindowTokens: 1_048_576 + 8192,
      description:
        'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
      displayName: 'Gemini 2.0 Flash',
      enabled: true,
      functionCall: true,
      id: 'google/gemini-2.0-flash-001',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.025,
        input: 0.1,
        output: 0.4,
      },
      releasedAt: '2025-02-05',
      vision: true,
    },
    {
      contextWindowTokens: 2_000_000 + 8192,
      description: 'Gemini 1.5 Pro 结合最新优化技术，带来更高效的多模态数据处理能力。',
      displayName: 'Gemini 1.5 Pro',
      enabled: true,
      functionCall: true,
      id: 'google/gemini-pro-1.5',
      maxOutput: 8192,
      pricing: {
        input: 3.5,
        output: 10.5,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        '融合通用与代码能力的全新开源模型, 不仅保留了原有 Chat 模型的通用对话能力和 Coder 模型的强大代码处理能力，还更好地对齐了人类偏好。此外，DeepSeek-V2.5 在写作任务、指令跟随等多个方面也实现了大幅提升。',
      displayName: 'DeepSeek V2.5',
      enabled: true,
      functionCall: true,
      id: 'deepseek/deepseek-chat',
      pricing: {
        input: 0.14,
        output: 0.28,
      },
      releasedAt: '2024-09-05',
    },
    {
      contextWindowTokens: 163_840,
      description: 'DeepSeek-R1',
      displayName: 'DeepSeek R1',
      enabled: true,
      functionCall: false,
      id: 'deepseek/deepseek-r1',
      pricing: {
        input: 3,
        output: 8,
      },
      releasedAt: '2025-01-20',
    },
    {
      contextWindowTokens: 163_840,
      description: 'DeepSeek-R1',
      displayName: 'DeepSeek R1 (Free)',
      enabled: true,
      functionCall: false,
      id: 'deepseek/deepseek-r1:free',
      releasedAt: '2025-01-20',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 11B Vision',
      enabled: true,
      id: 'meta-llama/llama-3.2-11b-vision-instruct',
      pricing: {
        input: 0.162,
        output: 0.162,
      },
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 90B Vision',
      enabled: true,
      id: 'meta-llama/llama-3.2-90b-vision-instruct',
      pricing: {
        input: 0.4,
        output: 0.4,
      },
      vision: true,
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Llama 3.3 是 Llama 系列最先进的多语言开源大型语言模型，以极低成本体验媲美 405B 模型的性能。基于 Transformer 结构，并通过监督微调（SFT）和人类反馈强化学习（RLHF）提升有用性和安全性。其指令调优版本专为多语言对话优化，在多项行业基准上表现优于众多开源和封闭聊天模型。知识截止日期为 2023 年 12 月',
      displayName: 'Llama 3.3 70B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta-llama/llama-3.3-70b-instruct',
      pricing: {
        input: 0.12,
        output: 0.3,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Llama 3.3 是 Llama 系列最先进的多语言开源大型语言模型，以极低成本体验媲美 405B 模型的性能。基于 Transformer 结构，并通过监督微调（SFT）和人类反馈强化学习（RLHF）提升有用性和安全性。其指令调优版本专为多语言对话优化，在多项行业基准上表现优于众多开源和封闭聊天模型。知识截止日期为 2023 年 12 月',
      displayName: 'Llama 3.3 70B Instruct (Free)',
      enabled: true,
      functionCall: true,
      id: 'meta-llama/llama-3.3-70b-instruct:free',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen2 是全新的大型语言模型系列，具有更强的理解和生成能力。',
      displayName: 'Qwen2 7B (Free)',
      enabled: true,
      id: 'qwen/qwen-2-7b-instruct:free',
    },
    {
      contextWindowTokens: 32_768,
      description: 'LLaMA 3.1 提供多语言支持，是业界领先的生成模型之一。',
      displayName: 'Llama 3.1 8B (Free)',
      enabled: true,
      id: 'meta-llama/llama-3.1-8b-instruct:free',
    },
    {
      contextWindowTokens: 8192,
      description: 'Gemma 2 是Google轻量化的开源文本模型系列。',
      displayName: 'Gemma 2 9B (Free)',
      enabled: true,
      id: 'google/gemma-2-9b-it:free',
    },
    {
      contextWindowTokens: 2_097_152 + 8192,
      description:
        'Gemini 2.0 Pro Experimental 是 Google 最新的实验性多模态AI模型，与历史版本相比有一定的质量提升，特别是对于世界知识、代码和长上下文。',
      displayName: 'Gemini 2.0 Pro Experimental 02-05 (Free)',
      enabled: true,
      functionCall: true,
      id: 'google/gemini-2.0-pro-exp-02-05:free',
      maxOutput: 8192,
      releasedAt: '2025-02-05',
      vision: true,
    },
  ],
  checkModel: 'google/gemma-2-9b-it:free',
  description:
    'OpenRouter 是一个提供多种前沿大模型接口的服务平台，支持 OpenAI、Anthropic、LLaMA 及更多，适合多样化的开发和应用需求。用户可根据自身需求灵活选择最优的模型和价格，助力AI体验的提升。',
  id: 'openrouter',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://openrouter.ai/models',
  name: 'OpenRouter',
  proxyUrl: {
    placeholder: 'https://openrouter.ai/api/v1',
  },
  settings: {
    // OpenRouter don't support browser request
    // https://github.com/lobehub/lobe-chat/issues/5900
    disableBrowserRequest: true,

    proxyUrl: {
      placeholder: 'https://openrouter.ai/api/v1',
    },
    sdkType: 'openai',
    searchMode: 'params',
    showModelFetcher: true,
  },
  url: 'https://openrouter.ai',
};

export default OpenRouter;
