import { AIChatModelCard } from '@/types/aiModel';

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

export const allModels = [...giteeaiChatModels];

export default allModels;
