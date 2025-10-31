import { AIChatModelCard } from '../types/aiModel';

// https://cloud.infini-ai.com/genstudio/model

const infiniaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'MiniMax-M2 是一款专为编码与智能体工作流优化的专家混合（MoE）语言模型，具有约 230B 总参数与约 10B 活跃参数。它在保持强通用智能的同时，针对多文件编辑、代码-运行-修复闭环、测试校验修复等开发者场景进行深度增强，在终端、IDE 与 CI 等真实环境中表现稳定、高效。',
    displayName: 'MiniMax M2',
    enabled: true,
    id: 'minimax-m2',
    maxOutput: 200_000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'GLM-4.6 是智谱AI推出的最新大语言模型，具备更强的推理和生成能力。',
    displayName: 'GLM-4.6',
    enabled: true,
    id: 'glm-4.6',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-V3.2-Exp 是深度求索推出的实验性大语言模型，具有更强的推理和生成能力。',
    displayName: 'DeepSeek V3.2 Exp',
    enabled: true,
    id: 'deepseek-v3.2-exp',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 235B A22B Instruct 是通义千问推出的多模态模型，支持视觉理解和推理。',
    displayName: 'Qwen3 VL 235B A22B Instruct',
    id: 'qwen3-vl-235b-a22b-instruct',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 235B A22B Thinking 是通义千问推出的多模态推理模型，支持视觉理解和推理。',
    displayName: 'Qwen3 VL 235B A22B Thinking',
    id: 'qwen3-vl-235b-a22b-thinking',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-V3.1-Terminus 是深度求索推出的终端优化版本大语言模型，专为终端设备优化。',
    displayName: 'DeepSeek V3.1 Terminus',
    id: 'deepseek-v3.1-terminus',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      '基于 Qwen3 的新一代思考模式开源模型，相较上一版本（通义千问3-235B-A22B-Thinking-2507）指令遵循能力有提升、模型总结回复更加精简。',
    displayName: 'Qwen3 Next 80B A3B Thinking',
    id: 'qwen3-next-80b-a3b-thinking',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      '基于 Qwen3 的新一代非思考模式开源模型，相较上一版本（通义千问3-235B-A22B-Instruct-2507）中文文本理解能力更佳、逻辑推理能力有增强、文本生成类任务表现更好。',
    displayName: 'Qwen3 Next 80B A3B Instruct',
    id: 'qwen3-next-80b-a3b-instruct',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'DeepSeek V3.1 模型为混合推理架构模型，同时支持思考模式与非思考模式。',
    displayName: 'DeepSeek V3.1',
    id: 'deepseek-v3.1',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 64_000,
    description: 'Baichuan M2 32B 是百川智能推出的混合专家模型，具备强大的推理能力。',
    displayName: 'Baichuan M2 32B',
    id: 'baichuan-m2-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 11.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'GLM-4.5V 是智谱AI推出的多模态模型，支持视觉理解和推理。',
    displayName: 'GLM-4.5V',
    id: 'glm-4.5v',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'GLM-4.5系列模型是智谱AI专为智能体设计的混合推理模型，提供思考与非思考两种模式。',
    displayName: 'GLM-4.5',
    id: 'glm-4.5',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'GLM-4.5-Air 是智谱AI推出的轻量级大语言模型，具备高效的推理能力。',
    displayName: 'GLM-4.5-Air',
    id: 'glm-4.5-air',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Step3 是阶跃星辰推出的多模态模型，具备强大的视觉理解能力。',
    displayName: 'Step3',
    id: 'step3',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      '通义千问代码模型开源版。最新的 qwen3-coder-480b-a35b-instruct 是基于 Qwen3 的代码生成模型，具有强大的Coding Agent能力，擅长工具调用和环境交互，能够实现自主编程、代码能力卓越的同时兼具通用能力。',
    displayName: 'Qwen3 Coder 480B A35B',
    id: 'qwen3-coder-480b-a35b-instruct',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 36, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      '基于Qwen3的非思考模式开源模型，相较上一版本（通义千问3-235B-A22B）主观创作能力与模型安全性均有小幅度提升。',
    displayName: 'Qwen3 235B A22B Instruct 2507',
    id: 'qwen3-235b-a22b-instruct-2507',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Kimi K2 Instruct 是月之暗面推出的大语言模型，具有超长上下文处理能力。',
    displayName: 'Kimi K2 Instruct',
    id: 'kimi-k2-instruct',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description: 'ERNIE 4.5 300B A47B 是百度文心推出的超大规模混合专家模型，具备卓越的推理能力。',
    displayName: 'ERNIE 4.5 300B A47B',
    id: 'ernie-4.5-300b-a47b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 120_000,
    description: 'ERNIE 4.5 21B A3B 是百度文心推出的混合专家模型，具备强大的推理和多语言能力。',
    displayName: 'ERNIE 4.5 21B A3B',
    id: 'ernie-4.5-21b-a3b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen3-8B 是 Qwen 系列第三代的大型语言模型，拥有 82 亿参数，专为高效推理和多语言任务设计。支持无缝切换思维模式（复杂推理）和非思维模式（通用对话），在数学、编码、常识推理及多语言指令执行中表现出色。',
    displayName: 'Qwen3 8B',
    id: 'qwen3-8b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen3-14B 是 Qwen 系列第三代的大型语言模型，拥有 148 亿参数，专为高效推理和多语言任务设计。支持无缝切换思维模式（复杂推理）和非思维模式（通用对话），在数学、编码、常识推理及多语言指令执行中表现出色。',
    displayName: 'Qwen3 14B',
    id: 'qwen3-14b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen3-32B 是 Qwen 系列第三代的大型语言模型，拥有 328 亿参数，专为高效推理和多语言任务设计。支持无缝切换思考模式（复杂推理）和非思考模式（通用对话），在数学、编码、常识推理及多语言指令执行中表现出色。',
    displayName: 'Qwen3 32B',
    id: 'qwen3-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 11.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen3-30B-A3B 是 Qwen 系列第三代的大型语言模型，采用混合专家（MoE）架构，总计 305 亿参数，每 token 激活 33 亿参数。支持无缝切换思维模式（复杂推理）和非思维模式（通用对话），在数学、编码、常识推理及多语言指令执行中表现出色。',
    displayName: 'Qwen3 30B A3B',
    id: 'qwen3-30b-a3b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8.7, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen3-235B-A22B 是 Qwen 系列第三代的大型语言模型，采用混合专家（MoE）架构，总计 2350 亿参数，每 token 激活 220 亿参数。支持无缝切换思考模式（复杂推理）和非思维模式（通用对话），在数学、编码、常识推理及多语言指令执行中表现出色。',
    displayName: 'Qwen3 235B A22B',
    id: 'qwen3-235b-a22b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 125_000,
    description:
      'Qwen2.5-VL 系列模型提升了模型的智能水平、实用性和适用性，使其在自然对话、内容创作、专业知识服务及代码开发等场景中表现更优。旗舰模型 Qwen2.5-VL-72B-Instruct 在涵盖多个领域和任务的基准测试中展现出强大的竞争力，包括大学水平的问题解答、数学、文档理解、通用问答、视频理解以及视觉代理任务等。',
    displayName: 'Qwen2.5 VL 72B Instruct',
    id: 'qwen2.5-vl-72b-instruct',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 125_000,
    description:
      'Qwen2.5-VL 系列模型提升了模型的智能水平、实用性和适用性，使其在自然对话、内容创作、专业知识服务及代码开发等场景中表现更优。模型 Qwen2.5-VL-32B-Instruct 在涵盖多个领域和任务的基准测试中展现出强大的竞争力，包括大学水平的问题解答、数学、文档理解、通用问答、视频理解以及视觉代理任务等。',
    displayName: 'Qwen2.5 VL 32B Instruct',
    id: 'qwen2.5-vl-32b-instruct',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5.8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 125_000,
    description:
      'Qwen2.5-VL 系列模型提升了模型的智能水平、实用性和适用性，使其在自然对话、内容创作、专业知识服务及代码开发等场景中表现更优。模型 Qwen2.5-VL-7B-Instruct 在涵盖多个领域和任务的基准测试中展现出强大的竞争力，包括大学水平的问题解答、数学、文档理解、通用问答、视频理解以及视觉代理任务等。',
    displayName: 'Qwen2.5 VL 7B Instruct',
    id: 'qwen2.5-vl-7b-instruct',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description: 'QwQ 32B 是通义千问推出的推理专用模型，专注于推理任务。',
    displayName: 'QwQ 32B',
    id: 'qwq-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-V3-0324 是一个强大的专家混合（MoE）语言模型，总参数量为 671B，每个 Token 激活 37B 参数。该模型采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，实现了高效推理和经济训练，并在前代 DeepSeek-V3 的基础上显著提升了性能。',
    displayName: 'DeepSeek V3 0324',
    id: 'deepseek-v3',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-R1 是一个专注于推理能力的大语言模型，通过创新的训练流程实现了与 OpenAI-o1 相当的数学、代码和推理任务表现。该模型采用了冷启动数据和大规模强化学习相结合的方式进行训练。',
    displayName: 'DeepSeek R1',
    id: 'deepseek-r1',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description: 'DeepSeek R1 Distill Qwen 32B 是深度求索基于Qwen蒸馏的高效模型。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'deepseek-r1-distill-qwen-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description: 'Megrez 3B Instruct 是无问芯穹推出的小参数量高效模型。',
    displayName: 'Megrez 3B Instruct',
    id: 'megrez-3b-instruct',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 32B Instruct',
    id: 'qwen2.5-32b-instruct',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 72B Instruct',
    id: 'qwen2.5-72b-instruct',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 14B Instruct',
    id: 'qwen2.5-14b-instruct',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 7B Instruct',
    id: 'qwen2.5-7b-instruct',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-Coder 是最新的代码专用 Qwen 大型语言模型系列。Qwen2.5-Coder 在 CodeQwen1.5 的基础上带来了以下改进：\n显著提升代码生成、代码推理和代码修复能力。\n支持真实世界应用，例如代码代理，增强编码能力和数学及一般能力。\n支持长上下文处理。',
    displayName: 'Qwen2.5 Coder 32B Instruct',
    id: 'qwen2.5-coder-32b-instruct',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '该模型需要申请体验。GPT-OSS-120B 是 OpenAI 推出的开源大规模语言模型，具备强大的文本生成能力。',
    displayName: 'GPT-OSS-120B',
    id: 'gpt-oss-120b',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '该模型需要申请体验。GPT-OSS-20B 是 OpenAI 推出的开源中型语言模型，具备高效的文本生成能力。',
    displayName: 'GPT-OSS-20B',
    id: 'gpt-oss-20b',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: '企业专属服务专用模型，包并发服务。',
    displayName: 'DeepSeek R1 (Pro)',
    id: 'pro-deepseek-r1',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '企业专属服务专用模型，包并发服务。',
    displayName: 'DeepSeek V3 (Pro)',
    id: 'pro-deepseek-v3',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...infiniaiChatModels];

export default allModels;
