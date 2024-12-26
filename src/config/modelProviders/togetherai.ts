import { ModelProviderCard } from '@/types/llm';

// ref: https://docs.together.ai/docs/chat-models
// ref: https://www.together.ai/pricing
const TogetherAI: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 3B Instruct Turbo',
      enabled: true,
      id: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 11B Vision Instruct Turbo (Free)',
      enabled: true,
      id: 'meta-llama/Llama-Vision-Free',
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 11B Vision Instruct Turbo',
      id: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 90B Vision Instruct Turbo',
      enabled: true,
      id: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Llama 3.1 8B 模型采用FP8量化，支持高达131,072个上下文标记，是开源模型中的佼佼者，适合复杂任务，表现优异于许多行业基准。',
      displayName: 'Llama 3.1 8B Instruct Turbo',
      enabled: true,
      functionCall: true,
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Llama 3.1 70B 模型经过精细调整，适用于高负载应用，量化至FP8提供更高效的计算能力和准确性，确保在复杂场景中的卓越表现。',
      displayName: 'Llama 3.1 70B Instruct Turbo',
      enabled: true,
      functionCall: true,
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 130_815,
      description:
        '405B 的 Llama 3.1 Turbo 模型，为大数据处理提供超大容量的上下文支持，在超大规模的人工智能应用中表现突出。',
      displayName: 'Llama 3.1 405B Instruct Turbo',
      enabled: true,
      functionCall: true,
      id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Llama 3.1 Nemotron 70B 是由 NVIDIA 定制的大型语言模型，旨在提高 LLM 生成的响应对用户查询的帮助程度。该模型在 Arena Hard、AlpacaEval 2 LC 和 GPT-4-Turbo MT-Bench 等基准测试中表现出色，截至 2024 年 10 月 1 日，在所有三个自动对齐基准测试中排名第一。该模型使用 RLHF（特别是 REINFORCE）、Llama-3.1-Nemotron-70B-Reward 和 HelpSteer2-Preference 提示在 Llama-3.1-70B-Instruct 模型基础上进行训练',
      displayName: 'Llama 3.1 Nemotron 70B',
      enabled: true,
      id: 'nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
    },
    {
      contextWindowTokens: 8192,
      description: 'Llama 3 8B Instruct Turbo 是一款高效能的大语言模型，支持广泛的应用场景。',
      displayName: 'Llama 3 8B Instruct Turbo',
      id: 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 8192,
      description:
        'Llama 3 70B Instruct Turbo 提供卓越的语言理解和生成能力，适合最苛刻的计算任务。',
      displayName: 'Llama 3 70B Instruct Turbo',
      id: 'meta-llama/Meta-Llama-3-70B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 8192,
      description: 'Llama 3 8B Instruct Lite 适合资源受限的环境，提供出色的平衡性能。',
      displayName: 'Llama 3 8B Instruct Lite',
      id: 'meta-llama/Meta-Llama-3-8B-Instruct-Lite',
    },
    {
      contextWindowTokens: 8192,
      description: 'Llama 3 70B Instruct Lite 适合需要高效能和低延迟的环境。',
      displayName: 'Llama 3 70B Instruct Lite',
      id: 'meta-llama/Meta-Llama-3-70B-Instruct-Lite',
    },
    {
      contextWindowTokens: 8192,
      description: 'Llama 3 8B Instruct Reference 提供多语言支持，涵盖丰富的领域知识。',
      displayName: 'Llama 3 8B Instruct Reference',
      id: 'meta-llama/Llama-3-8b-chat-hf',
    },
    {
      contextWindowTokens: 8192,
      description: 'Llama 3 70B Instruct Reference 是功能强大的聊天模型，支持复杂的对话需求。',
      displayName: 'Llama 3 70B Instruct Reference',
      id: 'meta-llama/Llama-3-70b-chat-hf',
    },
    {
      contextWindowTokens: 4096,
      description: 'LLaMA-2 Chat (13B) 提供优秀的语言处理能力和出色的交互体验。',
      displayName: 'LLaMA-2 Chat (13B)',
      id: 'meta-llama/Llama-2-13b-chat-hf',
    },
    {
      contextWindowTokens: 4096,
      description: 'LLaMA-2 提供优秀的语言处理能力和出色的交互体验。',
      displayName: 'LLaMA-2 (70B)',
      id: 'meta-llama/Llama-2-70b-hf',
    },
    {
      contextWindowTokens: 16_384,
      description:
        'Code Llama 是一款专注于代码生成和讨论的 LLM，结合广泛的编程语言支持，适用于开发者环境。',
      displayName: 'CodeLlama 34B Instruct',
      id: 'codellama/CodeLlama-34b-Instruct-hf',
    },
    {
      contextWindowTokens: 8192,
      description: 'Gemma 2 9B 由Google开发，提供高效的指令响应和综合能力。',
      displayName: 'Gemma 2 9B',
      enabled: true,
      id: 'google/gemma-2-9b-it',
    },
    {
      contextWindowTokens: 8192,
      description: 'Gemma 2 27B 是一款通用大语言模型，具有优异的性能和广泛的应用场景。',
      displayName: 'Gemma 2 27B',
      enabled: true,
      id: 'google/gemma-2-27b-it',
    },
    {
      contextWindowTokens: 8192,
      description: 'Gemma Instruct (2B) 提供基本的指令处理能力，适合轻量级应用。',
      displayName: 'Gemma Instruct (2B)',
      id: 'google/gemma-2b-it',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Mistral (7B) Instruct v0.3 提供高效的计算能力和自然语言理解，适合广泛的应用。',
      displayName: 'Mistral (7B) Instruct v0.3',
      enabled: true,
      id: 'mistralai/Mistral-7B-Instruct-v0.3',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Mistral (7B) Instruct v0.2 提供改进的指令处理能力和更精确的结果。',
      displayName: 'Mistral (7B) Instruct v0.2',
      id: 'mistralai/Mistral-7B-Instruct-v0.2',
    },
    {
      contextWindowTokens: 8192,
      description: 'Mistral (7B) Instruct 以高性能著称，适用于多种语言任务。',
      displayName: 'Mistral (7B) Instruct',
      functionCall: true,
      id: 'mistralai/Mistral-7B-Instruct-v0.1',
    },
    {
      contextWindowTokens: 8192,
      description:
        'Mistral 7B是一款紧凑但高性能的模型，擅长批量处理和简单任务，如分类和文本生成，具有良好的推理能力。',
      displayName: 'Mistral (7B)',
      id: 'mistralai/Mistral-7B-v0.1',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Mixtral-8x7B Instruct (46.7B) 提供高容量的计算框架，适合大规模数据处理。',
      displayName: 'Mixtral-8x7B Instruct (46.7B)',
      enabled: true,
      functionCall: true,
      id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Mixtral 8x7B是一个稀疏专家模型，利用多个参数提高推理速度，适合处理多语言和代码生成任务。',
      displayName: 'Mixtral-8x7B (46.7B)',
      id: 'mistralai/Mixtral-8x7B-v0.1',
    },
    {
      contextWindowTokens: 65_536,
      description: 'Mixtral-8x22B Instruct (141B) 是一款超级大语言模型，支持极高的处理需求。',
      displayName: 'Mixtral-8x22B Instruct (141B)',
      enabled: true,
      id: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
    },
    {
      contextWindowTokens: 65_536,
      description:
        'WizardLM 2 是微软AI提供的语言模型，在复杂对话、多语言、推理和智能助手领域表现尤为出色。',
      displayName: 'WizardLM-2 8x22B',
      id: 'microsoft/WizardLM-2-8x22B',
    },
    {
      contextWindowTokens: 4096,
      description: 'DeepSeek LLM Chat (67B) 是创新的 AI 模型 提供深度语言理解和互动能力。',
      displayName: 'DeepSeek LLM Chat (67B)',
      enabled: true,
      id: 'deepseek-ai/deepseek-llm-67b-chat',
    },
    {
      contextWindowTokens: 32_768,
      description: 'QwQ模型是由 Qwen 团队开发的实验性研究模型，专注于增强 AI 推理能力。',
      displayName: 'QwQ 32B Preview',
      enabled: true,
      id: 'Qwen/QwQ-32B-Preview',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen2.5 是全新的大型语言模型系列，旨在优化指令式任务的处理。',
      displayName: 'Qwen 2.5 7B Instruct Turbo',
      enabled: true,
      id: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen2.5 是全新的大型语言模型系列，旨在优化指令式任务的处理。',
      displayName: 'Qwen 2.5 72B Instruct Turbo',
      enabled: true,
      id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2.5 Coder 32B Instruct 是阿里云发布的代码特定大语言模型系列的最新版本。该模型在 Qwen2.5 的基础上，通过 5.5 万亿个 tokens 的训练，显著提升了代码生成、推理和修复能力。它不仅增强了编码能力，还保持了数学和通用能力的优势。模型为代码智能体等实际应用提供了更全面的基础',
      displayName: 'Qwen 2.5 Coder 32B Instruct',
      id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen 2 Instruct (72B) 为企业级应用提供精准的指令理解和响应。',
      displayName: 'Qwen 2 Instruct (72B)',
      id: 'Qwen/Qwen2-72B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'DBRX Instruct 提供高可靠性的指令处理能力，支持多行业应用。',
      displayName: 'DBRX Instruct',
      id: 'databricks/dbrx-instruct',
    },
    {
      contextWindowTokens: 4096,
      description: 'Upstage SOLAR Instruct v1 (11B) 适用于精细化指令任务，提供出色的语言处理能力。',
      displayName: 'Upstage SOLAR Instruct v1 (11B)',
      id: 'upstage/SOLAR-10.7B-Instruct-v1.0',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Nous Hermes 2 - Mixtral 8x7B-DPO (46.7B) 是高精度的指令模型，适用于复杂计算。',
      displayName: 'Nous Hermes 2 - Mixtral 8x7B-DPO (46.7B)',
      id: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
    },
    {
      contextWindowTokens: 4096,
      description: 'MythoMax-L2 (13B) 是一种创新模型，适合多领域应用和复杂任务。',
      displayName: 'MythoMax-L2 (13B)',
      id: 'Gryphe/MythoMax-L2-13b',
    },
    {
      contextWindowTokens: 32_768,
      description: 'StripedHyena Nous (7B) 通过高效的策略和模型架构，提供增强的计算能力。',
      displayName: 'StripedHyena Nous (7B)',
      id: 'togethercomputer/StripedHyena-Nous-7B',
    },
  ],
  checkModel: 'meta-llama/Llama-Vision-Free',
  description:
    'Together AI 致力于通过创新的 AI 模型实现领先的性能，提供广泛的自定义能力，包括快速扩展支持和直观的部署流程，满足企业的各种需求。',
  id: 'togetherai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.together.ai/docs/chat-models',
  name: 'Together AI',
  url: 'https://www.together.ai',
};

export default TogetherAI;
