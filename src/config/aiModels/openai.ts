import {
  AIChatModelCard,
  AIEmbeddingModelCard,
  AIRealtimeModelCard,
  AISTTModelCard,
  AITTSModelCard,
  AIText2ImageModelCard,
} from '@/types/aiModel';

export const openaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3 是一款全能强大的模型，在多个领域表现出色。它为数学、科学、编程和视觉推理任务树立了新标杆。它也擅长技术写作和指令遵循。用户可利用它分析文本、代码和图像，解决多步骤的复杂问题。',
    displayName: 'o3',
    enabled: true,
    id: 'o3',
    maxOutput: 100_000,
    pricing: {
      cachedInput: 2.5,
      input: 10,
      output: 40,
    },
    releasedAt: '2025-04-17',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o4-mini 是我们最新的小型 o 系列模型。 它专为快速有效的推理而优化，在编码和视觉任务中表现出极高的效率和性能。',
    displayName: 'o4-mini',
    enabled: true,
    id: 'o4-mini',
    maxOutput: 100_000,
    pricing: {
      cachedInput: 0.275,
      input: 1.1,
      output: 4.4,
    },
    releasedAt: '2025-04-17',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 是我们用于复杂任务的旗舰模型。它非常适合跨领域解决问题。',
    displayName: 'GPT-4.1',
    enabled: true,
    id: 'gpt-4.1',
    maxOutput: 32_768,
    pricing: {
      cachedInput: 0.5,
      input: 2,
      output: 8,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
    displayName: 'GPT-4.1 mini',
    enabled: true,
    id: 'gpt-4.1-mini',
    maxOutput: 32_768,
    pricing: {
      cachedInput: 0.1,
      input: 0.4,
      output: 1.6,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 nano 是最快，最具成本效益的GPT-4.1模型。',
    displayName: 'GPT-4.1 nano',
    id: 'gpt-4.1-nano',
    maxOutput: 32_768,
    pricing: {
      cachedInput: 0.025,
      input: 0.1,
      output: 0.4,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3-mini 是我们最新的小型推理模型，在与 o1-mini 相同的成本和延迟目标下提供高智能。',
    displayName: 'o3-mini',
    id: 'o3-mini',
    maxOutput: 100_000,
    pricing: {
      cachedInput: 0.55,
      input: 1.1,
      output: 4.4,
    },
    releasedAt: '2025-01-31',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-mini',
    id: 'o1-mini',
    maxOutput: 65_536,
    pricing: {
      cachedInput: 0.55,
      input: 1.1,
      output: 4.4,
    },
    releasedAt: '2024-09-12',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
    displayName: 'o1',
    id: 'o1',
    maxOutput: 100_000,
    pricing: {
      cachedInput: 7.5,
      input: 15,
      output: 60,
    },
    releasedAt: '2024-12-17',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-preview',
    id: 'o1-preview',
    maxOutput: 32_768,
    pricing: {
      input: 15,
      output: 60,
    },
    releasedAt: '2024-09-12',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4.5 的研究预览版，它是我们迄今为止最大、最强大的 GPT 模型。它拥有广泛的世界知识，并能更好地理解用户意图，使其在创造性任务和自主规划方面表现出色。GPT-4.5 可接受文本和图像输入，并生成文本输出（包括结构化输出）。支持关键的开发者功能，如函数调用、批量 API 和流式输出。在需要创造性、开放式思考和对话的任务（如写作、学习或探索新想法）中，GPT-4.5 表现尤为出色。知识截止日期为 2023 年 10 月。',
    displayName: 'GPT-4.5 Preview',
    id: 'gpt-4.5-preview', // deprecated on 2025-07-14
    maxOutput: 16_384,
    pricing: {
      cachedInput: 37.5,
      input: 75,
      output: 150,
    },
    releasedAt: '2025-02-27',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini是OpenAI在GPT-4 Omni之后推出的最新模型，支持图文输入并输出文本。作为他们最先进的小型模型，它比其他近期的前沿模型便宜很多，并且比GPT-3.5 Turbo便宜超过60%。它保持了最先进的智能，同时具有显著的性价比。GPT-4o mini在MMLU测试中获得了 82% 的得分，目前在聊天偏好上排名高于 GPT-4。',
    displayName: 'GPT-4o mini',
    id: 'gpt-4o-mini',
    maxOutput: 16_384,
    pricing: {
      cachedInput: 0.075,
      input: 0.15,
      output: 0.6,
    },
    releasedAt: '2024-07-18',
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini 搜索预览版是一个专门训练用于理解和执行网页搜索查询的模型，使用的是 Chat Completions API。除了令牌费用之外，网页搜索查询还会按每次工具调用收取费用。',
    displayName: 'GPT-4o mini Search Preview',
    id: 'gpt-4o-mini-search-preview',
    maxOutput: 16_384,
    pricing: {
      input: 0.15,
      output: 0.6,
    },
    releasedAt: '2025-03-11',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o',
    id: 'gpt-4o',
    pricing: {
      cachedInput: 1.25,
      input: 2.5,
      output: 10,
    },
    releasedAt: '2024-05-13',
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o 搜索预览版是一个专门训练用于理解和执行网页搜索查询的模型，使用的是 Chat Completions API。除了令牌费用之外，网页搜索查询还会按每次工具调用收取费用。',
    displayName: 'GPT-4o Search Preview',
    id: 'gpt-4o-search-preview',
    maxOutput: 16_384,
    pricing: {
      input: 2.5,
      output: 10,
    },
    releasedAt: '2025-03-11',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o 1120',
    id: 'gpt-4o-2024-11-20',
    pricing: {
      cachedInput: 1.25,
      input: 2.5,
      output: 10,
    },
    releasedAt: '2024-11-20',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o 0513',
    id: 'gpt-4o-2024-05-13',
    pricing: {
      input: 5,
      output: 15,
    },
    releasedAt: '2024-05-13',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'GPT-4o Audio 模型，支持音频输入输出',
    displayName: 'GPT-4o Audio',
    id: 'gpt-4o-audio-preview',
    maxOutput: 16_384,
    pricing: {
      input: 2.5,
      output: 10,
    },
    releasedAt: '2024-10-01',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'ChatGPT-4o',
    enabled: true,
    id: 'chatgpt-4o-latest',
    pricing: {
      input: 5,
      output: 15,
    },
    releasedAt: '2024-08-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
    displayName: 'GPT-4 Turbo',
    id: 'gpt-4-turbo',
    pricing: {
      input: 10,
      output: 30,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
    displayName: 'GPT-4 Turbo Vision 0409',
    id: 'gpt-4-turbo-2024-04-09',
    pricing: {
      input: 10,
      output: 30,
    },
    releasedAt: '2024-04-09',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
    displayName: 'GPT-4 Turbo Preview',
    id: 'gpt-4-turbo-preview',
    pricing: {
      input: 10,
      output: 30,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
    displayName: 'GPT-4 Turbo Preview 0125',
    id: 'gpt-4-0125-preview',
    pricing: {
      input: 10,
      output: 30,
    },
    releasedAt: '2024-01-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      '最新的 GPT-4 Turbo 模型具备视觉功能。现在，视觉请求可以使用 JSON 模式和函数调用。 GPT-4 Turbo 是一个增强版本，为多模态任务提供成本效益高的支持。它在准确性和效率之间找到平衡，适合需要进行实时交互的应用程序场景。',
    displayName: 'GPT-4 Turbo Preview 1106',
    id: 'gpt-4-1106-preview',
    pricing: {
      input: 10,
      output: 30,
    },
    releasedAt: '2023-11-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'GPT-4 提供了一个更大的上下文窗口，能够处理更长的文本输入，适用于需要广泛信息整合和数据分析的场景。',
    displayName: 'GPT-4',
    id: 'gpt-4',
    pricing: {
      input: 30,
      output: 60,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'GPT-4 提供了一个更大的上下文窗口，能够处理更长的文本输入，适用于需要广泛信息整合和数据分析的场景。',
    displayName: 'GPT-4 0613',
    id: 'gpt-4-0613',
    pricing: {
      input: 30,
      output: 60,
    },
    releasedAt: '2023-06-13',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,

    description:
      'GPT-4 提供了一个更大的上下文窗口，能够处理更长的文本输入，适用于需要广泛信息整合和数据分析的场景。',
    displayName: 'GPT-4 32K',
    id: 'gpt-4-32k', // deprecated on 2025-06-06
    legacy: true,
    pricing: {
      input: 60,
      output: 120,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo',
    id: 'gpt-3.5-turbo',
    pricing: {
      input: 0.5,
      output: 1.5,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo 0125',
    id: 'gpt-3.5-turbo-0125',
    pricing: {
      input: 0.5,
      output: 1.5,
    },
    releasedAt: '2024-01-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo 1106',
    id: 'gpt-3.5-turbo-1106',
    pricing: {
      input: 1,
      output: 2,
    },
    releasedAt: '2023-11-06',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'GPT 3.5 Turbo，适用于各种文本生成和理解任务，对指令遵循的优化',
    displayName: 'GPT-3.5 Turbo Instruct',
    id: 'gpt-3.5-turbo-instruct',
    pricing: {
      input: 1.5,
      output: 2,
    },
    type: 'chat',
  },
];

export const openaiEmbeddingModels: AIEmbeddingModelCard[] = [
  {
    contextWindowTokens: 8192,
    description: '最强大的向量化模型，适用于英文和非英文任务',
    displayName: 'Text Embedding 3 Large',
    id: 'text-embedding-3-large',
    maxDimension: 3072,
    pricing: {
      currency: 'USD',
      input: 0.13,
    },
    releasedAt: '2024-01-25',
    type: 'embedding',
  },
  {
    contextWindowTokens: 8192,
    description: '高效且经济的新一代 Embedding 模型，适用于知识检索、RAG 应用等场景',
    displayName: 'Text Embedding 3 Small',
    id: 'text-embedding-3-small',
    maxDimension: 1536,
    pricing: {
      currency: 'USD',
      input: 0.02,
    },
    releasedAt: '2024-01-25',
    type: 'embedding',
  },
];

// 语音合成模型
export const openaiTTSModels: AITTSModelCard[] = [
  {
    description: '最新的文本转语音模型，针对实时场景优化速度',
    displayName: 'TTS-1',
    id: 'tts-1',
    pricing: {
      input: 15,
    },
    type: 'tts',
  },
  {
    description: '最新的文本转语音模型，针对质量进行优化',
    displayName: 'TTS-1 HD',
    id: 'tts-1-hd',
    pricing: {
      input: 30,
    },
    type: 'tts',
  },
  {
    description:
      'GPT-4o mini TTS 是一个基于 GPT-4o mini 构建的文本转语音模型，这是一种快速且强大的语言模型。使用它可以将文本转换为自然听起来的语音文本。最大输入标记数为 2000。',
    displayName: 'GPT-4o Mini TTS',
    id: 'gpt-4o-mini-tts',
    pricing: {
      input: 10,
    },
    type: 'tts',
  },
];

// 语音识别模型
export const openaiSTTModels: AISTTModelCard[] = [
  {
    description: '通用语音识别模型，支持多语言语音识别、语音翻译和语言识别',
    displayName: 'Whisper',
    id: 'whisper-1',
    pricing: {
      input: 0.006, // per minute
    },
    type: 'stt',
  },
];

// 图像生成模型
export const openaiImageModels: AIText2ImageModelCard[] = [
  {
    description:
      '最新的 DALL·E 模型，于2023年11月发布。支持更真实、准确的图像生成，具有更强的细节表现力',
    displayName: 'DALL·E 3',
    id: 'dall-e-3',
    pricing: {
      hd: 0.08,
      standard: 0.04,
    },
    resolutions: ['1024x1024', '1024x1792', '1792x1024'],
    type: 'image',
  },
  {
    description: '第二代 DALL·E 模型，支持更真实、准确的图像生成，分辨率是第一代的4倍',
    displayName: 'DALL·E 2',
    id: 'dall-e-2',
    pricing: {
      input: 0.02, // $0.020 per image (1024×1024)
    },
    resolutions: ['256x256', '512x512', '1024x1024'],
    type: 'image',
  },
];

// GPT-4o 和 GPT-4o-mini 实时模型
export const openaiRealtimeModels: AIRealtimeModelCard[] = [
  {
    contextWindowTokens: 128_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime',
    id: 'gpt-4o-realtime-preview',
    maxOutput: 4096,
    pricing: {
      audioInput: 100,
      audioOutput: 200,
      cachedAudioInput: 20,
      cachedInput: 2.5,
      input: 5,
      output: 20,
    },
    releasedAt: '2024-10-01',
    type: 'realtime',
  },
  {
    contextWindowTokens: 128_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 10-01',
    id: 'gpt-4o-realtime-preview-2024-10-01',
    maxOutput: 4096,
    pricing: {
      audioInput: 100,
      audioOutput: 200,
      cachedAudioInput: 20,
      cachedInput: 2.5,
      input: 5,
      output: 20,
    },
    releasedAt: '2024-10-01',
    type: 'realtime',
  },
  {
    contextWindowTokens: 128_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 12-17',
    id: 'gpt-4o-realtime-preview-2024-12-17',
    maxOutput: 4096,
    pricing: {
      audioInput: 40,
      audioOutput: 80,
      cachedAudioInput: 2.5,
      cachedInput: 2.5,
      input: 5,
      output: 20,
    },
    releasedAt: '2024-12-17',
    type: 'realtime',
  },
  {
    contextWindowTokens: 128_000,
    description: 'GPT-4o-mini 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Mini Realtime',
    id: 'gpt-4o-mini-realtime-preview',
    maxOutput: 4096,
    pricing: {
      audioInput: 10,
      audioOutput: 20,
      cachedAudioInput: 0.3,
      cachedInput: 0.3,
      input: 0.6,
      output: 2.4,
    },
    releasedAt: '2024-12-17',
    type: 'realtime',
  },
];

export const allModels = [
  ...openaiChatModels,
  ...openaiEmbeddingModels,
  ...openaiTTSModels,
  ...openaiSTTModels,
  ...openaiImageModels,
  ...openaiRealtimeModels,
];

export default allModels;
