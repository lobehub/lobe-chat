import { AIChatModelCard } from '@/types/aiModel';

const fireworksaiChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 131_072,
    description:
        'Llama 3.3 70B Instruct 是 Llama 3.1 70B 的 12 月更新版本。该模型在 Llama 3.1 70B（于 2024 年 7 月发布）的基础上进行了改进，增强了工具调用、多语言文本支持、数学和编程能力。该模型在推理、数学和指令遵循方面达到了行业领先水平，并且能够提供与 3.1 405B 相似的性能，同时在速度和成本上具有显著优势。',
    displayName: 'Llama 3.3 70B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.2 3B Instruct 是 Meta 推出的轻量级多语言模型。该模型专为高效运行而设计，相较于更大型的模型，具有显著的延迟和成本优势。其典型应用场景包括查询和提示重写，以及写作辅助。',
    displayName: 'Llama 3.2 3B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p2-3b-instruct',
    pricing: {
      input: 0.1,
      output: 0.1,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Meta 推出的指令微调图像推理模型，拥有 110 亿参数。该模型针对视觉识别、图像推理、图片字幕生成以及图片相关的常规问答进行了优化。它能够理解视觉数据，如图表和图形，并通过生成文本描述图像细节，弥合视觉与语言之间的鸿沟。',
    displayName: 'Llama 3.2 11B Vision Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p2-11b-vision-instruct',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Meta 推出的指令微调图像推理模型，拥有 900 亿参数。该模型针对视觉识别、图像推理、图片字幕生成以及图片相关的常规问答进行了优化。它能够理解视觉数据，如图表和图形，并通过生成文本描述图像细节，弥合视觉与语言之间的鸿沟。注意：该模型目前作为无服务器模型进行实验性提供。如果用于生产环境，请注意 Fireworks 可能会在短时间内取消部署该模型。',
    displayName: 'Llama 3.2 90B Vision Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p2-90b-vision-instruct',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Meta Llama 3.1 系列是多语言大语言模型（LLM）集合，包含 8B、70B 和 405B 三种参数规模的预训练和指令微调生成模型。Llama 3.1 指令微调文本模型（8B、70B、405B）专为多语言对话应用优化，并在常见的行业基准测试中优于许多现有的开源和闭源聊天模型。',
    displayName: 'Llama 3.1 8B Instruct',
    id: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Meta Llama 3.1 系列是多语言大语言模型（LLM）集合，包含 8B、70B 和 405B 三种参数规模的预训练和指令微调生成模型。Llama 3.1 指令微调文本模型（8B、70B、405B）专为多语言对话应用优化，并在常见的行业基准测试中优于许多现有的开源和闭源聊天模型。',
    displayName: 'Llama 3.1 70B Instruct',
    id: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Meta Llama 3.1 系列是多语言大语言模型（LLM）集合，包含 8B、70B 和 405B 参数规模的预训练和指令微调生成模型。Llama 3.1 指令微调文本模型（8B、70B、405B）专为多语言对话场景优化，在常见的行业基准测试中优于许多现有的开源和闭源聊天模型。405B 是 Llama 3.1 家族中能力最强的模型。该模型采用 FP8 进行推理，与参考实现高度匹配。',
    displayName: 'Llama 3.1 405B Instruct',
    id: 'accounts/fireworks/models/llama-v3p1-405b-instruct',
    pricing: {
      input: 3,
      output: 3,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Meta 开发并发布了 Meta Llama 3 系列大语言模型（LLM），这是一个包含 8B 和 70B 参数规模的预训练和指令微调生成文本模型的集合。Llama 3 指令微调模型专为对话应用场景优化，并在常见的行业基准测试中优于许多现有的开源聊天模型。',
    displayName: 'Llama 3 8B Instruct',
    id: 'accounts/fireworks/models/llama-v3-8b-instruct',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Meta 开发并发布了 Meta Llama 3 系列大语言模型（LLM），该系列包含 8B 和 70B 参数规模的预训练和指令微调生成文本模型。Llama 3 指令微调模型专为对话应用场景优化，并在常见的行业基准测试中优于许多现有的开源聊天模型。',
    displayName: 'Llama 3 70B Instruct',
    id: 'accounts/fireworks/models/llama-v3-70b-instruct',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Meta Llama 3 指令微调模型专为对话应用场景优化，并在常见的行业基准测试中优于许多现有的开源聊天模型。Llama 3 8B Instruct（HF 版本）是 Llama 3 8B Instruct 的原始 FP16 版本，其结果应与官方 Hugging Face 实现一致。',
    displayName: 'Llama 3 8B Instruct (HF version)',
    id: 'accounts/fireworks/models/llama-v3-8b-instruct-hf',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      '24B 参数模型，具备与更大型模型相当的最先进能力。',
    displayName: 'Mistral Small 3 Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/mistral-small-24b-instruct-2501',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Mixtral MoE 8x7B Instruct 是 Mixtral MoE 8x7B 的指令微调版本，已启用聊天完成功能 API。',
    displayName: 'Mixtral MoE 8x7B Instruct',
    id: 'accounts/fireworks/models/mixtral-8x7b-instruct',
    pricing: {
      input: 0.5,
      output: 0.5,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      'Mixtral MoE 8x22B Instruct v0.1 是 Mixtral MoE 8x22B v0.1 的指令微调版本，已启用聊天完成功能 API。',
    displayName: 'Mixtral MoE 8x22B Instruct',
    id: 'accounts/fireworks/models/mixtral-8x22b-instruct',
    pricing: {
      input: 1.2,
      output: 1.2,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_064,
    description:
      'Phi-3-Vision-128K-Instruct 是一个轻量级的、最先进的开放多模态模型，基于包括合成数据和筛选后的公开网站数据集构建，重点关注文本和视觉方面的高质量、推理密集型数据。该模型属于 Phi-3 模型家族，其多模态版本支持 128K 上下文长度（以标记为单位）。该模型经过严格的增强过程，包括监督微调和直接偏好优化，以确保精确的指令遵循和强大的安全措施。',
    displayName: 'Phi 3.5 Vision Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/phi-3-vision-128k-instruct',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'MythoMix 的改进版，可能是其更为完善的变体，是 MythoLogic-L2 和 Huginn 的合并，采用了高度实验性的张量类型合并技术。由于其独特的性质，该模型在讲故事和角色扮演方面表现出色。',
    displayName: 'MythoMax L2 13b',
    id: 'accounts/fireworks/models/mythomax-l2-13b',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Deepseek 提供的强大 Mixture-of-Experts (MoE) 语言模型，总参数量为 671B，每个标记激活 37B 参数。',
    displayName: 'Deepseek V3',
    enabled: true,
    id: 'accounts/fireworks/models/deepseek-v3',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-R1 是一款最先进的大型语言模型，经过强化学习和冷启动数据的优化，具有出色的推理、数学和编程性能。',
    displayName: 'Deepseek R1',
    enabled: true,
    id: 'accounts/fireworks/models/deepseek-r1',
    pricing: {
      input: 8,
      output: 8,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen QwQ 模型专注于推动 AI 推理，并展示了开放模型在推理能力上与闭源前沿模型匹敌的力量。QwQ-32B-Preview 是一个实验性发布版本，在 GPQA、AIME、MATH-500 和 LiveCodeBench 基准测试中，在分析和推理能力上可与 o1 相媲美，并超越 GPT-4o 和 Claude 3.5 Sonnet。注意：该模型目前作为无服务器模型进行实验性提供。如果用于生产环境，请注意 Fireworks 可能会在短时间内取消部署该模型。',
    displayName: 'Qwen Qwq 32b Preview',
    enabled: true,
    id: 'accounts/fireworks/models/qwen-qwq-32b-preview',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 是由 Qwen 团队和阿里云开发的一系列仅解码语言模型，提供 0.5B、1.5B、3B、7B、14B、32B 和 72B 不同参数规模，并包含基础版和指令微调版。',
    displayName: 'Qwen2.5 72B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/qwen2p5-72b-instruct',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen-VL 模型的 72B 版本是阿里巴巴最新迭代的成果，代表了近一年的创新。',
    displayName: 'Qwen2 VL 72B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/qwen2-vl-72b-instruct',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-Coder 是最新一代专为代码设计的 Qwen 大型语言模型（前称为 CodeQwen）。注意：该模型目前作为无服务器模型进行实验性提供。如果用于生产环境，请注意 Fireworks 可能会在短时间内取消部署该模型。',
    displayName: 'Qwen2.5-Coder-32B-Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/qwen2p5-coder-32b-instruct',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Yi-Large 是顶尖的大型语言模型之一，在 LMSYS 基准测试排行榜上，其表现仅次于 GPT-4、Gemini 1.5 Pro 和 Claude 3 Opus。它在多语言能力方面表现卓越，特别是在西班牙语、中文、日语、德语和法语方面。Yi-Large 还具有用户友好性，采用与 OpenAI 相同的 API 定义，便于集成。',
    displayName: 'Yi-Large',
    enabled: true,
    id: 'accounts/yi-01-ai/models/yi-large',
    pricing: {
      input: 3,
      output: 3,
    },
    type: 'chat',
  },
];

export const allModels = [...fireworksaiChatModels];

export default allModels;
