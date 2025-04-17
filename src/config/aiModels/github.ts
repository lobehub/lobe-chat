import { AIChatModelCard } from '@/types/aiModel';

const githubChatModels: AIChatModelCard[] = [
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
    id: 'o3',
    maxOutput: 100_000,
    pricing: {
      cachedInput: 2.5,
      input: 10,
      output: 40,
    },
    releasedAt: '2025-04-17',
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 是我们用于复杂任务的旗舰模型。它非常适合跨领域解决问题。',
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
    description:
      'GPT-4.1 nano 是最快，最具成本效益的GPT-4.1模型。',
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
    displayName: 'OpenAI o4-mini',
    id: 'o4-mini',
    maxOutput: 100_000,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_074_176,
    displayName: 'OpenAI GPT-4.1',
    id: 'gpt-4.1',
    maxOutput: 33_792,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_074_176,
    displayName: 'OpenAI GPT-4.1 mini',
    id: 'gpt-4.1-mini',
    maxOutput: 33_792,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_074_176,
    displayName: 'OpenAI GPT-4.1 nano',
    id: 'gpt-4.1-nano',
    maxOutput: 33_792,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 134_144,
    description: '一种经济高效的AI解决方案，适用于多种文本和图像任务。',
    displayName: 'GPT-4o mini',
    id: 'gpt-4o-mini',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 134_144,
    description: 'OpenAI GPT-4系列中最先进的多模态模型，可以处理文本和图像输入。',
    displayName: 'GPT-4o',
    id: 'gpt-4o',
    maxOutput: 16_384,
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    displayName: 'DeepSeek R1',
    id: 'DeepSeek-R1',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      '一个52B参数（12B活跃）的多语言模型，提供256K长上下文窗口、函数调用、结构化输出和基于事实的生成。',
    displayName: 'AI21 Jamba 1.5 Mini',
    id: 'ai21-jamba-1.5-mini',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      '一个398B参数（94B活跃）的多语言模型，提供256K长上下文窗口、函数调用、结构化输出和基于事实的生成。',
    displayName: 'AI21 Jamba 1.5 Large',
    id: 'ai21-jamba-1.5-large',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'Command R是一个可扩展的生成模型，旨在针对RAG和工具使用，使企业能够实现生产级AI。',
    displayName: 'Cohere Command R',
    id: 'cohere-command-r',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'Command R+是一个最先进的RAG优化模型，旨在应对企业级工作负载。',
    displayName: 'Cohere Command R+',
    id: 'cohere-command-r-plus',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Mistral Nemo是一种尖端的语言模型（LLM），在其尺寸类别中拥有最先进的推理、世界知识和编码能力。',
    displayName: 'Mistral Nemo',
    id: 'mistral-nemo',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'Mistral Small可用于任何需要高效率和低延迟的基于语言的任务。',
    displayName: 'Mistral Small',
    id: 'mistral-small',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Mistral的旗舰模型，适合需要大规模推理能力或高度专业化的复杂任务（合成文本生成、代码生成、RAG或代理）。',
    displayName: 'Mistral Large',
    id: 'mistral-large',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 262_144,
    displayName: 'Codestral',
    id: 'Codestral-2501',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: '在高分辨率图像上表现出色的图像推理能力，适用于视觉理解应用。',
    displayName: 'Llama 3.2 11B Vision',
    id: 'llama-3.2-11b-vision-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: '适用于视觉理解代理应用的高级图像推理能力。',
    displayName: 'Llama 3.2 90B Vision',
    id: 'llama-3.2-90b-vision-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Llama 3.3 是 Llama 系列最先进的多语言开源大型语言模型，以极低成本体验媲美 405B 模型的性能。基于 Transformer 结构，并通过监督微调（SFT）和人类反馈强化学习（RLHF）提升有用性和安全性。其指令调优版本专为多语言对话优化，在多项行业基准上表现优于众多开源和封闭聊天模型。知识截止日期为 2023 年 12 月',
    displayName: 'Llama 3.3 70B Instruct',
    enabled: true,
    id: 'llama-3.3-70b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
    displayName: 'Meta Llama 3.1 8B',
    id: 'meta-llama-3.1-8b-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
    displayName: 'Meta Llama 3.1 70B',
    id: 'meta-llama-3.1-70b-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
    displayName: 'Meta Llama 3.1 405B',
    id: 'meta-llama-3.1-405b-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '一个多功能的80亿参数模型，针对对话和文本生成任务进行了优化。',
    displayName: 'Meta Llama 3 8B',
    id: 'meta-llama-3-8b-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '一个强大的700亿参数模型，在推理、编码和广泛的语言应用方面表现出色。',
    displayName: 'Meta Llama 3 70B',
    id: 'meta-llama-3-70b-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    displayName: 'Phi 4',
    id: 'Phi-4',
    maxOutput: 16_384,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'Phi 3.5 MoE',
    id: 'Phi-3.5-MoE-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'Phi-3-mini模型的更新版。',
    displayName: 'Phi-3.5-mini 128K',
    id: 'Phi-3.5-mini-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Phi-3-vision模型的更新版。',
    displayName: 'Phi-3.5-vision 128K',
    id: 'Phi-3.5-vision-instrust',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'Phi-3家族中最小的成员，针对质量和低延迟进行了优化。',
    displayName: 'Phi-3-mini 4K',
    id: 'Phi-3-mini-4k-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '相同的Phi-3-mini模型，但具有更大的上下文大小，适用于RAG或少量提示。',
    displayName: 'Phi-3-mini 128K',
    id: 'Phi-3-mini-128k-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '一个70亿参数模型，质量优于Phi-3-mini，重点关注高质量、推理密集型数据。',
    displayName: 'Phi-3-small 8K',
    id: 'Phi-3-small-8k-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '相同的Phi-3-small模型，但具有更大的上下文大小，适用于RAG或少量提示。',
    displayName: 'Phi-3-small 128K',
    id: 'Phi-3-small-128k-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: '一个140亿参数模型，质量优于Phi-3-mini，重点关注高质量、推理密集型数据。',
    displayName: 'Phi-3-medium 4K',
    id: 'Phi-3-medium-4k-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '相同的Phi-3-medium模型，但具有更大的上下文大小，适用于RAG或少量提示。',
    displayName: 'Phi-3-medium 128K',
    id: 'Phi-3-medium-128k-instruct',
    maxOutput: 4096,
    type: 'chat',
  },
];

export const allModels = [...githubChatModels];

export default allModels;
