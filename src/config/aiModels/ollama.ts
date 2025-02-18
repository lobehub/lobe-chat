import { AIChatModelCard } from '@/types/aiModel';

const ollamaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-R1 是一款强化学习（RL）驱动的推理模型，解决了模型中的重复性和可读性问题。在 RL 之前，DeepSeek-R1 引入了冷启动数据，进一步优化了推理性能。它在数学、代码和推理任务中与 OpenAI-o1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
    displayName: 'Llama 3.1 8B',
    id: 'llama3.1',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
    displayName: 'Llama 3.1 70B',
    id: 'llama3.1:70b',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
    displayName: 'Llama 3.1 405B',
    id: 'llama3.1:405b',
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description:
      'Code Llama 是一款专注于代码生成和讨论的 LLM，结合广泛的编程语言支持，适用于开发者环境。',
    displayName: 'Code Llama 7B',
    id: 'codellama',
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description:
      'Code Llama 是一款专注于代码生成和讨论的 LLM，结合广泛的编程语言支持，适用于开发者环境。',
    displayName: 'Code Llama 13B',
    id: 'codellama:13b',
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description:
      'Code Llama 是一款专注于代码生成和讨论的 LLM，结合广泛的编程语言支持，适用于开发者环境。',
    displayName: 'Code Llama 34B',
    id: 'codellama:34b',
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description:
      'Code Llama 是一款专注于代码生成和讨论的 LLM，结合广泛的编程语言支持，适用于开发者环境。',
    displayName: 'Code Llama 70B',
    id: 'codellama:70b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description: 'QwQ 是一个实验研究模型，专注于提高 AI 推理能力。',
    displayName: 'QwQ 32B',
    id: 'qwq',
    releasedAt: '2024-11-28',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'Qwen2.5 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2.5 0.5B',
    id: 'qwen2.5:0.5b',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'Qwen2.5 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2.5 1.5B',
    id: 'qwen2.5:1.5b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Qwen2.5 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2.5 7B',
    id: 'qwen2.5',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'Qwen2.5 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2.5 72B',
    id: 'qwen2.5:72b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description: 'CodeQwen1.5 是基于大量代码数据训练的大型语言模型，专为解决复杂编程任务。',
    displayName: 'CodeQwen1.5 7B',
    id: 'codeqwen',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Qwen2 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2 0.5B',
    id: 'qwen2:0.5b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Qwen2 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2 1.5B',
    id: 'qwen2:1.5b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Qwen2 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2 7B',
    id: 'qwen2',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Qwen2 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
    displayName: 'Qwen2 72B',
    id: 'qwen2:72b',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Gemma 2 是 Google 推出的高效模型，涵盖从小型应用到复杂数据处理的多种应用场景。',
    displayName: 'Gemma 2 2B',
    id: 'gemma2:2b',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Gemma 2 是 Google 推出的高效模型，涵盖从小型应用到复杂数据处理的多种应用场景。',
    displayName: 'Gemma 2 9B',
    id: 'gemma2',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Gemma 2 是 Google 推出的高效模型，涵盖从小型应用到复杂数据处理的多种应用场景。',
    displayName: 'Gemma 2 27B',
    id: 'gemma2:27b',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'CodeGemma 专用于不同编程任务的轻量级语言模型，支持快速迭代和集成。',
    displayName: 'CodeGemma 2B',
    id: 'codegemma:2b',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'CodeGemma 专用于不同编程任务的轻量级语言模型，支持快速迭代和集成。',
    displayName: 'CodeGemma 7B',
    id: 'codegemma',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'Phi-3 是微软推出的轻量级开放模型，适用于高效集成和大规模知识推理。',
    displayName: 'Phi-3 3.8B',
    id: 'phi3',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'Phi-3 是微软推出的轻量级开放模型，适用于高效集成和大规模知识推理。',
    displayName: 'Phi-3 14B',
    id: 'phi3:14b',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'WizardLM 2 是微软AI提供的语言模型，在复杂对话、多语言、推理和智能助手领域表现尤为出色。',
    displayName: 'WizardLM 2 7B',
    id: 'wizardlm2',
    type: 'chat',
  },
  {
    contextWindowTokens: 65_536,
    description:
      'WizardLM 2 是微软AI提供的语言模型，在复杂对话、多语言、推理和智能助手领域表现尤为出色。',
    displayName: 'WizardLM 2 8x22B',
    id: 'wizardlm2:8x22b',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'MathΣtral 专为科学研究和数学推理设计，提供有效的计算能力和结果解释。',
    displayName: 'MathΣtral 7B',
    id: 'mathstral',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: 'Mistral 是 Mistral AI 发布的 7B 模型，适合多变的语言处理需求。',
    displayName: 'Mistral 7B',
    id: 'mistral',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Mixtral 是 Mistral AI 的专家模型，具有开源权重，并在代码生成和语言理解方面提供支持。',
    displayName: 'Mixtral 8x7B',
    id: 'mixtral',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      'Mixtral 是 Mistral AI 的专家模型，具有开源权重，并在代码生成和语言理解方面提供支持。',
    displayName: 'Mixtral 8x22B',
    id: 'mixtral:8x22b',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Mixtral Large 是 Mistral 的旗舰模型，结合代码生成、数学和推理的能力，支持 128k 上下文窗口。',
    displayName: 'Mixtral Large 123B',
    id: 'mistral-large',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: 'Mistral Nemo 由 Mistral AI 和 NVIDIA 合作推出，是高效性能的 12B 模型。',
    displayName: 'Mixtral Nemo 12B',
    id: 'mistral-nemo',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Codestral 是 Mistral AI 的首款代码模型，为代码生成任务提供优异支持。',
    displayName: 'Codestral 22B',
    id: 'codestral',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Aya 23 是 Cohere 推出的多语言模型，支持 23 种语言，为多元化语言应用提供便利。',
    displayName: 'Aya 23 8B',
    id: 'aya',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Aya 23 是 Cohere 推出的多语言模型，支持 23 种语言，为多元化语言应用提供便利。',
    displayName: 'Aya 23 35B',
    id: 'aya:35b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Command R 是优化用于对话和长上下文任务的LLM，特别适合动态交互与知识管理。',
    displayName: 'Command R 35B',
    id: 'command-r',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Command R+ 是一款高性能的大型语言模型，专为真实企业场景和复杂应用而设计。',
    displayName: 'Command R+ 104B',
    id: 'command-r-plus',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'DeepSeek V2 是高效的 Mixture-of-Experts 语言模型，适用于经济高效的处理需求。',
    displayName: 'DeepSeek V2 16B',
    id: 'deepseek-v2',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'DeepSeek V2 236B 是 DeepSeek 的设计代码模型，提供强大的代码生成能力。',
    displayName: 'DeepSeek V2 236B',
    id: 'deepseek-v2:236b',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'DeepSeek Coder V2 是开源的混合专家代码模型，在代码任务方面表现优异，与 GPT4-Turbo 相媲美。',
    displayName: 'DeepSeek Coder V2 16B',
    id: 'deepseek-coder-v2',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'DeepSeek Coder V2 是开源的混合专家代码模型，在代码任务方面表现优异，与 GPT4-Turbo 相媲美。',
    displayName: 'DeepSeek Coder V2 236B',
    id: 'deepseek-coder-v2:236b',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: 'LLaVA 是结合视觉编码器和 Vicuna 的多模态模型，用于强大的视觉和语言理解。',
    displayName: 'LLaVA 7B',
    id: 'llava',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: 'LLaVA 是结合视觉编码器和 Vicuna 的多模态模型，用于强大的视觉和语言理解。',
    displayName: 'LLaVA 13B',
    id: 'llava:13b',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: 'LLaVA 是结合视觉编码器和 Vicuna 的多模态模型，用于强大的视觉和语言理解。',
    displayName: 'LLaVA 34B',
    id: 'llava:34b',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'MiniCPM-V 是 OpenBMB 推出的新一代多模态大模型，具备卓越的 OCR 识别和多模态理解能力，支持广泛的应用场景。',
    displayName: 'MiniCPM-V 8B',
    id: 'minicpm-v',
    type: 'chat',
  },
];

export const allModels = [...ollamaChatModels];

export default allModels;
