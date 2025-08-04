import { AIChatModelCard, AIImageModelCard } from '@/types/aiModel';

const giteeaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description:
      '基于 Qwen2.5-Math-1.5B 的 DeepSeek-R1 蒸馏模型，通过强化学习与冷启动数据优化推理性能，开源模型刷新多任务标杆。',
    displayName: 'DeepSeek R1 Distill Qwen 1.5B',
    enabled: true,
    id: 'DeepSeek-R1-Distill-Qwen-1.5B',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description:
      '基于 Qwen2.5-Math-7B 的 DeepSeek-R1 蒸馏模型，通过强化学习与冷启动数据优化推理性能，开源模型刷新多任务标杆。',
    displayName: 'DeepSeek R1 Distill Qwen 7B',
    enabled: true,
    id: 'DeepSeek-R1-Distill-Qwen-7B',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description:
      '基于 Qwen2.5-14B 的 DeepSeek-R1 蒸馏模型，通过强化学习与冷启动数据优化推理性能，开源模型刷新多任务标杆。',
    displayName: 'DeepSeek R1 Distill Qwen 14B',
    enabled: true,
    id: 'DeepSeek-R1-Distill-Qwen-14B',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description:
      'DeepSeek-R1 系列通过强化学习与冷启动数据优化推理性能，开源模型刷新多任务标杆，超越 OpenAI-o1-mini 水平。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    enabled: true,
    id: 'DeepSeek-R1-Distill-Qwen-32B',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description:
      'QwQ-32B-Preview 是一款独具创新的自然语言处理模型，能够高效处理复杂的对话生成与上下文理解任务。',
    displayName: 'QwQ 32B Preview',
    enabled: true,
    id: 'QwQ-32B-Preview',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_000,
    description:
      'Qwen2.5-72B-Instruct  支持 16k 上下文, 生成长文本超过 8K 。支持 function call 与外部系统无缝交互，极大提升了灵活性和扩展性。模型知识明显增加，并且大大提高了编码和数学能力, 多语言支持超过 29 种',
    displayName: 'Qwen2.5 72B Instruct',
    enabled: true,
    id: 'Qwen2.5-72B-Instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      'Qwen2.5-32B-Instruct 是一款 320 亿参数的大语言模型，性能表现均衡，优化中文和多语言场景，支持智能问答、内容生成等应用。',
    displayName: 'Qwen2.5 32B Instruct',
    enabled: true,
    id: 'Qwen2.5-32B-Instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 24_000,
    description:
      'Qwen2.5-14B-Instruct 是一款 140 亿参数的大语言模型，性能表现优秀，优化中文和多语言场景，支持智能问答、内容生成等应用。',
    displayName: 'Qwen2.5 14B Instruct',
    enabled: true,
    id: 'Qwen2.5-14B-Instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_000,
    description:
      'Qwen2.5-7B-Instruct 是一款 70 亿参数的大语言模型，支持 function call 与外部系统无缝交互，极大提升了灵活性和扩展性。优化中文和多语言场景，支持智能问答、内容生成等应用。',
    displayName: 'Qwen2.5 7B Instruct',
    enabled: true,
    id: 'Qwen2.5-7B-Instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      'Qwen2 是 Qwen 模型的最新系列，支持 128k 上下文，对比当前最优的开源模型，Qwen2-72B 在自然语言理解、知识、代码、数学及多语言等多项能力上均显著超越当前领先的模型。',
    displayName: 'Qwen2 72B Instruct',
    id: 'Qwen2-72B-Instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 24_000,
    description:
      'Qwen2 是 Qwen 模型的最新系列，能够超越同等规模的最优开源模型甚至更大规模的模型，Qwen2 7B 在多个评测上取得显著的优势，尤其是代码及中文理解上。',
    displayName: 'Qwen2 7B Instruct',
    id: 'Qwen2-7B-Instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      'Qwen2.5-Coder-32B-Instruct 是一款专为代码生成、代码理解和高效开发场景设计的大型语言模型，采用了业界领先的32B参数规模，能够满足多样化的编程需求。',
    displayName: 'Qwen2.5 Coder 32B Instruct',
    enabled: true,
    id: 'Qwen2.5-Coder-32B-Instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 24_000,
    description:
      'Qwen2.5-Coder-14B-Instruct 是一款基于大规模预训练的编程指令模型，具备强大的代码理解和生成能力，能够高效地处理各种编程任务，特别适合智能代码编写、自动化脚本生成和编程问题解答。',
    displayName: 'Qwen2.5 Coder 14B Instruct',
    enabled: true,
    id: 'Qwen2.5-Coder-14B-Instruct',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_000,
    description:
      'Qwen2-VL-72B是一款强大的视觉语言模型，支持图像与文本的多模态处理，能够精确识别图像内容并生成相关描述或回答。',
    displayName: 'Qwen2 VL 72B',
    enabled: true,
    id: 'Qwen2-VL-72B',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_000,
    description:
      'InternVL2.5-26B 是一款强大的视觉语言模型，支持图像与文本的多模态处理，能够精确识别图像内容并生成相关描述或回答。',
    displayName: 'InternVL2.5 26B',
    enabled: true,
    id: 'InternVL2.5-26B',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_000,
    description:
      'InternVL2-8B 是一款强大的视觉语言模型，支持图像与文本的多模态处理，能够精确识别图像内容并生成相关描述或回答。',
    displayName: 'InternVL2 8B',
    enabled: true,
    id: 'InternVL2-8B',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      'GLM-4-9B-Chat 在语义、数学、推理、代码和知识等多方面均表现出较高性能。还具备网页浏览、代码执行、自定义工具调用和长文本推理。 支持包括日语，韩语，德语在内的 26 种语言。',
    displayName: 'GLM4 9B Chat',
    enabled: true,
    id: 'glm-4-9b-chat',
    type: 'chat',
  },
  {
    contextWindowTokens: 4000,
    description:
      'Yi-1.5-34B 在保持原系列模型优秀的通用语言能力的前提下，通过增量训练 5 千亿高质量 token，大幅提高了数学逻辑、代码能力。',
    displayName: 'Yi 34B Chat',
    enabled: true,
    id: 'Yi-34B-Chat',
    type: 'chat',
  },
  /*
    // not compatible with OpenAI SDK
  {
    description:
      '代码小浣熊是基于商汤大语言模型的软件智能研发助手，覆盖软件需求分析、架构设计、代码编写、软件测试等环节，满足用户代码编写、编程学习等各类需求。代码小浣熊支持 Python、Java、JavaScript、C++、Go、SQL 等 90+主流编程语言和 VS Code、IntelliJ IDEA 等主流 IDE。在实际应用中，代码小浣熊可帮助开发者提升编程效率超 50%。',
    displayName: 'code raccoon v1',
    enabled: true,
    id: 'code-raccoon-v1',
    type: 'chat',
  },
*/
  {
    contextWindowTokens: 8000,
    description:
      'DeepSeek Coder 33B 是一个代码语言模型， 基于 2 万亿数据训练而成，其中 87% 为代码， 13% 为中英文语言。模型引入 16K 窗口大小和填空任务，提供项目级别的代码补全和片段填充功能。',
    displayName: 'DeepSeek Coder 33B Instruct',
    enabled: true,
    id: 'deepseek-coder-33B-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      'CodeGeeX4-ALL-9B 是一个多语言代码生成模型，支持包括代码补全和生成、代码解释器、网络搜索、函数调用、仓库级代码问答在内的全面功能，覆盖软件开发的各种场景。是参数少于 10B 的顶尖代码生成模型。',
    displayName: 'CodeGeeX4 All 9B',
    enabled: true,
    id: 'codegeex4-all-9b',
    type: 'chat',
  },
];

const giteeaiImageModels: AIImageModelCard[] = [
  {
    description:
      'FLUX.1-dev 是由 Black Forest Labs 开发的一款开源 多模态语言模型（Multimodal Language Model, MLLM），专为图文任务优化，融合了图像和文本的理解与生成能力。它建立在先进的大语言模型（如 Mistral-7B）基础上，通过精心设计的视觉编码器与多阶段指令微调，实现了图文协同处理与复杂任务推理的能力。',
    displayName: 'FLUX.1-dev',
    enabled: true,
    id: 'FLUX.1-dev',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024', '1536x1536'],
      },
    },
    type: 'image',
  },
  {
    description:
      '由 Black Forest Labs 开发的 120 亿参数文生图模型，采用潜在对抗扩散蒸馏技术，能够在 1 到 4 步内生成高质量图像。该模型性能媲美闭源替代品，并在 Apache-2.0 许可证下发布，适用于个人、科研和商业用途。',
    displayName: 'flux-1-schnell',
    enabled: true,
    id: 'flux-1-schnell',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024', '1536x1536', '2048x2048'],
      },
    },
    type: 'image',
  },
  {
    description:
      'FLUX.1-Kontext-dev 是由 Black Forest Labs 开发的一款基于 Rectified Flow Transformer 架构 的多模态图像生成与编辑模型，拥有 12B（120 亿）参数规模，专注于在给定上下文条件下生成、重构、增强或编辑图像。该模型结合了扩散模型的可控生成优势与 Transformer 的上下文建模能力，支持高质量图像输出，广泛适用于图像修复、图像补全、视觉场景重构等任务。',
    displayName: 'FLUX.1-Kontext-dev',
    enabled: true,
    id: 'FLUX.1-Kontext-dev',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024', '1536x1536', '2048x2048'],
      },
    },
    type: 'image',
  },
  {
    description:
      'Stable Diffusion 3.5 Large Turbo 专注于高质量图像生成，具备强大的细节表现力和场景还原能力。',
    displayName: 'stable-diffusion-3.5-large-turbo',
    enabled: true,
    id: 'stable-diffusion-3.5-large-turbo',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      '由 Stability AI 推出的最新文生图大模型。这一版本在继承了前代的优点上，对图像质量、文本理解和风格多样性等方面进行了显著改进，能够更准确地解读复杂的自然语言提示，并生成更为精确和多样化的图像。',
    displayName: 'stable-diffusion-3-medium',
    enabled: true,
    id: 'stable-diffusion-3-medium',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      '由 Stability AI 开发并开源的文生图大模型，其创意图像生成能力位居行业前列。具备出色的指令理解能力，能够支持反向 Prompt 定义来精确生成内容。',
    displayName: 'stable-diffusion-xl-base-1.0',
    enabled: true,
    id: 'stable-diffusion-xl-base-1.0',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
    {
    description:
      'Kolors 是由快手 Kolors 团队开发的文生图模型。由数十亿的参数训练，在视觉质量、中文语义理解和文本渲染方面有显著优势。',
    displayName: 'Kolors',
    enabled: true,
    id: 'Kolors',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'hunyuandit-v1.2-distilled 是一款轻量级的文生图模型，经过蒸馏优化，能够快速生成高质量的图像，特别适用于低资源环境和实时生成任务。',
    displayName: 'HunyuanDiT-v1.2-Diffusers-Distilled',
    enabled: true,
    id: 'HunyuanDiT-v1.2-Diffusers-Distilled',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'HiDream-I1 是一个全新的开源图像生成基础模型，是由国内企业智象未来开源的。拥有 170 亿参数(Flux是12B参数)，能够在几秒内实现行业领先的图像生成质量。',
    displayName: 'HiDream-I1-Full',
    enabled: true,
    id: 'HiDream-I1-Full',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'HiDream-E1-Full 是由智象未来（HiDream.ai）推出的一款 开源多模态图像编辑大模型，基于先进的 Diffusion Transformer 架构，并结合强大的语言理解能力（内嵌 LLaMA 3.1-8B-Instruct），支持通过自然语言指令进行图像生成、风格迁移、局部编辑和内容重绘，具备出色的图文理解与执行能力。',
    displayName: 'HiDream-E1-Full',
    enabled: true,
    id: 'HiDream-I1-Full',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'HelloMeme 是一个可以根据你提供的图片或动作，自动生成表情包、动图或短视频的 AI 工具。它不需要你有任何绘画或编程基础，只需要准备好参考图片，它就能帮你做出好看、有趣、风格一致的内容。',
    displayName: 'HelloMeme',
    enabled: true,
    id: 'HelloMeme',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'OmniConsistency 通过引入大规模 Diffusion Transformers（DiTs）和配对风格化数据，提升图像到图像（Image-to-Image）任务中的风格一致性和泛化能力，避免风格退化。',
    displayName: 'OmniConsistency',
    enabled: true,
    id: 'OmniConsistency',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'InstantCharacter 是由腾讯 AI 团队在 2025 年发布的一款 无需微调（tuning-free） 的个性化角色生成模型，旨在实现高保真、跨场景的一致角色生成。该模型支持仅基于 一张参考图像 对角色进行建模，并能够将该角色灵活迁移到各种风格、动作和背景中。',
    displayName: 'InstantCharacter',
    enabled: true,
    id: 'InstantCharacter',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'DreamO 是由字节跳动与北京大学联合研发的开源图像定制生成模型，旨在通过统一架构支持多任务图像生成。它采用高效的组合建模方法，可根据用户指定的身份、主体、风格、背景等多个条件生成高度一致且定制化的图像。',
    displayName: 'DreamO',
    enabled: true,
    id: 'DreamO',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
  {
    description:
      'AnimeSharp（又名 “4x‑AnimeSharp”） 是 Kim2091 基于 ESRGAN 架构开发的开源超分辨率模型，专注于动漫风格图像的放大与锐化。它于 2022 年 2 月重命名自 “4x-TextSharpV1”，原本也适用于文字图像但性能针对动漫内容进行了大幅优化',
    displayName: 'AnimeSharp',
    enabled: true,
    id: 'AnimeSharp',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024'],
      },
    },
    type: 'image',
  },
];

export const allModels = [...giteeaiChatModels, ...giteeaiImageModels];

export default allModels;
