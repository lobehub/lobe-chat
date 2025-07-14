import { AIChatModelCard } from '@/types/aiModel';

// https://siliconflow.cn/zh-cn/models
const siliconcloudChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Pangu-Pro-MoE 72B-A16B 是一款 720 亿参数、激活 160 亿参的稀疏大语言模型，它基于分组混合专家（MoGE）架构，它在专家选择阶段对专家进行分组，并约束 token 在每个组内激活等量专家，从而实现专家负载均衡，显著提升模型在昇腾平台的部署效率。',
    displayName: 'Pangu Pro MoE 72B A16B',
    id: 'ascend-tribe/pangu-pro-moe',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-06-17',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'ERNIE-4.5-300B-A47B 是由百度公司开发的一款基于混合专家（MoE）架构的大语言模型。该模型总参数量为 3000 亿，但在推理时每个 token 仅激活 470 亿参数，从而在保证强大性能的同时兼顾了计算效率。作为 ERNIE 4.5 系列的核心模型之一，在文本理解、生成、推理和编程等任务上展现出卓越的能力。该模型采用了一种创新的多模态异构 MoE 预训练方法，通过文本与视觉模态的联合训练，有效提升了模型的综合能力，尤其在指令遵循和世界知识记忆方面效果突出。',
    displayName: 'ERNIE 4.5 300B A47B',
    id: 'baidu/ERNIE-4.5-300B-A47B',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    releasedAt: '2025-06-30',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi-Dev-72B 是一款开源代码大模型，经过大规模强化学习优化，能输出稳健、可直接投产的补丁。该模型在 SWE-bench Verified 上取得 60.4 % 的新高分，刷新了开源模型在缺陷修复、代码评审等自动化软件工程任务上的纪录。',
    displayName: 'Kimi Dev 72B',
    id: 'moonshotai/Kimi-Dev-72B',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    releasedAt: '2025-06-17',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Hunyuan-A13B-Instruct 参数量800 亿，激活 130 亿参数即可对标更大模型，支持“快思考/慢思考”混合推理；长文理解稳定；经 BFCL-v3 与 τ-Bench 验证，Agent 能力领先；结合 GQA 与多量化格式，实现高效推理。',
    displayName: 'Hunyuan A13B Instruct',
    id: 'tencent/Hunyuan-A13B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-06-27',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'MiniMax-M1 是开源权重的大规模混合注意力推理模型，拥有 4560 亿参数，每个 Token 可激活约 459 亿参数。模型原生支持 100 万 Token 的超长上下文，并通过闪电注意力机制，在 10 万 Token 的生成任务中相比 DeepSeek R1 节省 75% 的浮点运算量。同时，MiniMax-M1 采用 MoE（混合专家）架构，结合 CISPO 算法与混合注意力设计的高效强化学习训练，在长输入推理与真实软件工程场景中实现了业界领先的性能。',
    displayName: 'MiniMax M1 80K',
    id: 'MiniMaxAI/MiniMax-M1-80k',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    releasedAt: '2025-06-16',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'QwenLong-L1-32B 是首个使用强化学习训练的长上下文大型推理模型（LRM），专门针对长文本推理任务进行优化。该模型通过渐进式上下文扩展的强化学习框架，实现了从短上下文到长上下文的稳定迁移。在七个长上下文文档问答基准测试中，QwenLong-L1-32B 超越了 OpenAI-o3-mini 和 Qwen3-235B-A22B 等旗舰模型，性能可媲美 Claude-3.7-Sonnet-Thinking。该模型特别擅长数学推理、逻辑推理和多跳推理等复杂任务。',
    displayName: 'QwenLong L1 32B',
    id: 'Tongyi-Zhiwen/QwenLong-L1-32B',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-05-26',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen3是一款能力大幅提升的新一代通义千问大模型，在推理、通用、Agent和多语言等多个核心能力上均达到业界领先水平，并支持思考模式切换。',
    displayName: 'Qwen3 235B A22B',
    id: 'Qwen/Qwen3-235B-A22B',
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 2.5,
      output: 10,
    },
    releasedAt: '2025-04-28',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
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
      'Qwen3是一款能力大幅提升的新一代通义千问大模型，在推理、通用、Agent和多语言等多个核心能力上均达到业界领先水平，并支持思考模式切换。',
    displayName: 'Qwen3 32B',
    id: 'Qwen/Qwen3-32B',
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-04-28',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
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
      'Qwen3是一款能力大幅提升的新一代通义千问大模型，在推理、通用、Agent和多语言等多个核心能力上均达到业界领先水平，并支持思考模式切换。',
    displayName: 'Qwen3 30B A3B',
    id: 'Qwen/Qwen3-30B-A3B',
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0.7,
      output: 2.8,
    },
    releasedAt: '2025-04-28',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
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
      'Qwen3是一款能力大幅提升的新一代通义千问大模型，在推理、通用、Agent和多语言等多个核心能力上均达到业界领先水平，并支持思考模式切换。',
    displayName: 'Qwen3 14B',
    id: 'Qwen/Qwen3-14B',
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0.5,
      output: 2,
    },
    releasedAt: '2025-04-28',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
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
      'Qwen3是一款能力大幅提升的新一代通义千问大模型，在推理、通用、Agent和多语言等多个核心能力上均达到业界领先水平，并支持思考模式切换。',
    displayName: 'Qwen3 8B (Free)',
    enabled: true,
    id: 'Qwen/Qwen3-8B',
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    releasedAt: '2025-04-28',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 65_536,
    description:
      'GLM-4.1V-9B-Thinking 是由智谱 AI 和清华大学 KEG 实验室联合发布的一款开源视觉语言模型（VLM），专为处理复杂的多模态认知任务而设计。该模型基于 GLM-4-9B-0414 基础模型，通过引入“思维链”（Chain-of-Thought）推理机制和采用强化学习策略，显著提升了其跨模态的推理能力和稳定性。',
    displayName: 'GLM-4.1V 9B Thinking (Free)',
    enabled: true,
    id: 'THUDM/GLM-4.1V-9B-Thinking',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    releasedAt: '2025-07-02',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 65_536,
    description:
      'GLM-4.1V-9B-Thinking 是由智谱 AI 和清华大学 KEG 实验室联合发布的一款开源视觉语言模型（VLM），专为处理复杂的多模态认知任务而设计。该模型基于 GLM-4-9B-0414 基础模型，通过引入“思维链”（Chain-of-Thought）推理机制和采用强化学习策略，显著提升了其跨模态的推理能力和稳定性。',
    displayName: 'GLM-4.1V 9B Thinking (Pro)',
    id: 'Pro/THUDM/GLM-4.1V-9B-Thinking',
    pricing: {
      currency: 'CNY',
      input: 0.25,
      output: 1,
    },
    releasedAt: '2025-07-02',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GLM-Z1-Rumination-32B-0414 是一个具有沉思能力的深度推理模型（与 OpenAI 的 Deep Research 对标）。与典型的深度思考模型不同，沉思模型采用更长时间的深度思考来解决更开放和复杂的问题。',
    displayName: 'GLM-Z1-Rumination 32B 0414',
    id: 'THUDM/GLM-Z1-Rumination-32B-0414',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GLM-Z1-32B-0414 是一个具有深度思考能力的推理模型。该模型基于 GLM-4-32B-0414 通过冷启动和扩展强化学习开发，并在数学、代码和逻辑任务上进行了进一步训练。与基础模型相比，GLM-Z1-32B-0414 显著提升了数学能力和解决复杂任务的能力。',
    displayName: 'GLM-Z1 32B 0414',
    id: 'THUDM/GLM-Z1-32B-0414',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GLM-Z1-9B-0414 是 GLM 系列的小型模型，仅有 90 亿参数，但保持了开源传统的同时展现出惊人的能力。尽管规模较小，该模型在数学推理和通用任务上仍表现出色，其总体性能在同等规模的开源模型中已处于领先水平。',
    displayName: 'GLM-Z1 9B 0414 (Free)',
    id: 'THUDM/GLM-Z1-9B-0414',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'GLM-4-32B-0414 是 GLM 系列的新一代开源模型，拥有 320 亿参数。该模型性能可与 OpenAI 的 GPT 系列和 DeepSeek 的 V3/R1 系列相媲美。',
    displayName: 'GLM-4 32B 0414',
    id: 'THUDM/GLM-4-32B-0414',
    pricing: {
      currency: 'CNY',
      input: 1.89,
      output: 1.89,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'GLM-4-9B-0414 是 GLM 系列的小型模型，拥有 90 亿参数。该模型继承了 GLM-4-32B 系列的技术特点，但提供了更轻量级的部署选择。尽管规模较小，GLM-4-9B-0414 仍在代码生成、网页设计、SVG 图形生成和基于搜索的写作等任务上展现出色能力。',
    displayName: 'GLM-4 9B 0414 (Free)',
    id: 'THUDM/GLM-4-9B-0414',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GLM-4-9B-Chat 是智谱 AI 推出的 GLM-4 系列预训练模型中的开源版本。该模型在语义、数学、推理、代码和知识等多个方面表现出色。除了支持多轮对话外，GLM-4-9B-Chat 还具备网页浏览、代码执行、自定义工具调用（Function Call）和长文本推理等高级功能。模型支持 26 种语言，包括中文、英文、日语、韩语和德语等。在多项基准测试中，GLM-4-9B-Chat 展现了优秀的性能，如 AlignBench-v2、MT-Bench、MMLU 和 C-Eval 等。该模型支持最大 128K 的上下文长度，适用于学术研究和商业应用',
    displayName: 'GLM-4 9B Chat (Free)',
    id: 'THUDM/glm-4-9b-chat',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    releasedAt: '2024-06-04',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GLM-4-9B-Chat 是智谱 AI 推出的 GLM-4 系列预训练模型中的开源版本。该模型在语义、数学、推理、代码和知识等多个方面表现出色。除了支持多轮对话外，GLM-4-9B-Chat 还具备网页浏览、代码执行、自定义工具调用（Function Call）和长文本推理等高级功能。模型支持 26 种语言，包括中文、英文、日语、韩语和德语等。在多项基准测试中，GLM-4-9B-Chat 展现了优秀的性能，如 AlignBench-v2、MT-Bench、MMLU 和 C-Eval 等。该模型支持最大 128K 的上下文长度，适用于学术研究和商业应用',
    displayName: 'GLM-4 9B Chat (Pro)',
    id: 'Pro/THUDM/glm-4-9b-chat',
    pricing: {
      currency: 'CNY',
      input: 0.6,
      output: 0.6,
    },
    releasedAt: '2024-06-04',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-R1-0528-Qwen3-8B 是通过从 DeepSeek-R1-0528 模型蒸馏思维链到 Qwen3 8B Base 获得的模型。该模型在开源模型中达到了最先进（SOTA）的性能，在 AIME 2024 测试中超越了 Qwen3 8B 10%，并达到了 Qwen3-235B-thinking 的性能水平。该模型在数学推理、编程和通用逻辑等多个基准测试中表现出色，其架构与 Qwen3-8B 相同，但共享 DeepSeek-R1-0528 的分词器配置。',
    displayName: 'DeepSeek R1 0528 Qwen3 8B (Free)',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 98_304,
    description:
      'DeepSeek-R1 是一款强化学习（RL）驱动的推理模型，解决了模型中的重复性和可读性问题。在 RL 之前，DeepSeek-R1 引入了冷启动数据，进一步优化了推理性能。它在数学、代码和推理任务中与 OpenAI-o1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
    displayName: 'DeepSeek R1',
    id: 'deepseek-ai/DeepSeek-R1',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款拥有 6710 亿参数的混合专家（MoE）语言模型，采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，结合无辅助损失的负载平衡策略，优化推理和训练效率。通过在 14.8 万亿高质量tokens上预训练，并进行监督微调和强化学习，DeepSeek-V3 在性能上超越其他开源模型，接近领先闭源模型。',
    displayName: 'DeepSeek V3',
    id: 'deepseek-ai/DeepSeek-V3',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 98_304,
    description:
      'DeepSeek-R1 是一款强化学习（RL）驱动的推理模型，解决了模型中的重复性和可读性问题。在 RL 之前，DeepSeek-R1 引入了冷启动数据，进一步优化了推理性能。它在数学、代码和推理任务中与 OpenAI-o1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
    displayName: 'DeepSeek R1 (Pro)',
    id: 'Pro/deepseek-ai/DeepSeek-R1',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款拥有 6710 亿参数的混合专家（MoE）语言模型，采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，结合无辅助损失的负载平衡策略，优化推理和训练效率。通过在 14.8 万亿高质量tokens上预训练，并进行监督微调和强化学习，DeepSeek-V3 在性能上超越其他开源模型，接近领先闭源模型。',
    displayName: 'DeepSeek V3 (Pro)',
    id: 'Pro/deepseek-ai/DeepSeek-V3',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
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
      'DeepSeek-R1-Distill-Qwen-32B 是基于 Qwen2.5-32B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在数学、编程和推理等多个领域展现出卓越的性能。在 AIME 2024、MATH-500、GPQA Diamond 等多个基准测试中都取得了优异成绩，其中在 MATH-500 上达到了 94.3% 的准确率，展现出强大的数学推理能力。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    pricing: {
      currency: 'CNY',
      input: 1.26,
      output: 1.26,
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
      'DeepSeek-R1-Distill-Qwen-14B 是基于 Qwen2.5-14B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力。在多个基准测试中表现出色，其中在 MATH-500 上达到了 93.9% 的准确率，在 AIME 2024 上达到了 69.7% 的通过率，在 CodeForces 上获得了 1481 的评分，显示出在数学和编程领域的强大实力。',
    displayName: 'DeepSeek R1 Distill Qwen 14B',
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
    pricing: {
      currency: 'CNY',
      input: 0.7,
      output: 0.7,
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
      'DeepSeek-R1-Distill-Qwen-7B 是基于 Qwen2.5-Math-7B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力。在多个基准测试中表现出色，其中在 MATH-500 上达到了 92.8% 的准确率，在 AIME 2024 上达到了 55.5% 的通过率，在 CodeForces 上获得了 1189 的评分，作为 7B 规模的模型展示了较强的数学和编程能力。',
    displayName: 'DeepSeek R1 Distill Qwen 7B (Free)',
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
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
      'DeepSeek-R1-Distill-Qwen-7B 是基于 Qwen2.5-Math-7B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力。在多个基准测试中表现出色，其中在 MATH-500 上达到了 92.8% 的准确率，在 AIME 2024 上达到了 55.5% 的通过率，在 CodeForces 上获得了 1189 的评分，作为 7B 规模的模型展示了较强的数学和编程能力。',
    displayName: 'DeepSeek R1 Distill Qwen 7B (Pro)',
    id: 'Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    pricing: {
      currency: 'CNY',
      input: 0.35,
      output: 0.35,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-V2.5 是 DeepSeek-V2-Chat 和 DeepSeek-Coder-V2-Instruct 的升级版本，集成了两个先前版本的通用和编码能力。该模型在多个方面进行了优化，包括写作和指令跟随能力，更好地与人类偏好保持一致。DeepSeek-V2.5 在各种评估基准上都取得了显著的提升，如 AlpacaEval 2.0、ArenaHard、AlignBench 和 MT-Bench 等。',
    displayName: 'DeepSeek V2.5',
    id: 'deepseek-ai/DeepSeek-V2.5',
    pricing: {
      currency: 'CNY',
      input: 1.33,
      output: 1.33,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description:
      'DeepSeek-VL2 是一个基于 DeepSeekMoE-27B 开发的混合专家（MoE）视觉语言模型，采用稀疏激活的 MoE 架构，在仅激活 4.5B 参数的情况下实现了卓越性能。该模型在视觉问答、光学字符识别、文档/表格/图表理解和视觉定位等多个任务中表现优异。',
    displayName: 'DeepSeek VL2',
    id: 'deepseek-ai/deepseek-vl2',
    pricing: {
      currency: 'CNY',
      input: 0.99,
      output: 0.99,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'QVQ-72B-Preview 是由 Qwen 团队开发的专注于视觉推理能力的研究型模型，其在复杂场景理解和解决视觉相关的数学问题方面具有独特优势。',
    displayName: 'QVQ 72B Preview',
    id: 'Qwen/QVQ-72B-Preview',
    pricing: {
      currency: 'CNY',
      input: 9.9,
      output: 9.9,
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
      'QwQ 是 Qwen 系列的推理模型。与传统的指令调优模型相比，QwQ 具备思考和推理能力，能够在下游任务中实现显著增强的性能，尤其是在解决困难问题方面。QwQ-32B 是中型推理模型，能够在与最先进的推理模型（如 DeepSeek-R1、o1-mini）的对比中取得有竞争力的性能。该模型采用 RoPE、SwiGLU、RMSNorm 和 Attention QKV bias 等技术，具有 64 层网络结构和 40 个 Q 注意力头（GQA 架构中 KV 为 8 个）。',
    displayName: 'QwQ 32B',
    id: 'Qwen/QwQ-32B',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-7B-Instruct 是阿里云发布的最新大语言模型系列之一。该 7B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 7B Instruct (Free)',
    id: 'Qwen/Qwen2.5-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-7B-Instruct 是阿里云发布的最新大语言模型系列之一。该 7B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 7B Instruct (Pro)',
    id: 'Pro/Qwen/Qwen2.5-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.35,
      output: 0.35,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-14B-Instruct 是阿里云发布的最新大语言模型系列之一。该 14B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 14B Instruct',
    id: 'Qwen/Qwen2.5-14B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.7,
      output: 0.7,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-32B-Instruct 是阿里云发布的最新大语言模型系列之一。该 32B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 32B Instruct',
    id: 'Qwen/Qwen2.5-32B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 1.26,
      output: 1.26,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一。该 72B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 72B Instruct',
    id: 'Qwen/Qwen2.5-72B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 4.13,
      output: 4.13,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一。该 72B 模型在编码和数学等领域具有显著改进的能力。它支持长达 128K tokens 的输入，可以生成超过 8K tokens 的长文本。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 72B Instruct 128K',
    id: 'Qwen/Qwen2.5-72B-Instruct-128K',
    pricing: {
      currency: 'CNY',
      input: 4.13,
      output: 4.13,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-Coder-7B-Instruct 是阿里云发布的代码特定大语言模型系列的最新版本。该模型在 Qwen2.5 的基础上，通过 5.5 万亿个 tokens 的训练，显著提升了代码生成、推理和修复能力。它不仅增强了编码能力，还保持了数学和通用能力的优势。模型为代码智能体等实际应用提供了更全面的基础',
    displayName: 'Qwen2.5 Coder 7B Instruct (Free)',
    id: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-Coder-7B-Instruct 是阿里云发布的代码特定大语言模型系列的最新版本。该模型在 Qwen2.5 的基础上，通过 5.5 万亿个 tokens 的训练，显著提升了代码生成、推理和修复能力。它不仅增强了编码能力，还保持了数学和通用能力的优势。模型为代码智能体等实际应用提供了更全面的基础',
    displayName: 'Qwen2.5 Coder 7B Instruct (Pro)',
    id: 'Pro/Qwen/Qwen2.5-Coder-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.35,
      output: 0.35,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-Coder-32B-Instruct 是基于 Qwen2.5 开发的代码特定大语言模型。该模型通过 5.5 万亿 tokens 的训练，在代码生成、代码推理和代码修复方面都取得了显著提升。它是当前最先进的开源代码语言模型，编码能力可与 GPT-4 相媲美。模型不仅增强了编码能力，还保持了在数学和通用能力方面的优势，并支持长文本处理',
    displayName: 'Qwen2.5 Coder 32B Instruct',
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 1.26,
      output: 1.26,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2-7B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 7B。该模型基于 Transformer 架构，采用了 SwiGLU 激活函数、注意力 QKV 偏置和组查询注意力等技术。它能够处理大规模输入。该模型在语言理解、生成、多语言能力、编码、数学和推理等多个基准测试中表现出色，超越了大多数开源模型，并在某些任务上展现出与专有模型相当的竞争力。Qwen2-7B-Instruct 在多项评测中均优于 Qwen1.5-7B-Chat，显示出显著的性能提升',
    displayName: 'Qwen2 7B Instruct (Free)',
    id: 'Qwen/Qwen2-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2-7B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 7B。该模型基于 Transformer 架构，采用了 SwiGLU 激活函数、注意力 QKV 偏置和组查询注意力等技术。它能够处理大规模输入。该模型在语言理解、生成、多语言能力、编码、数学和推理等多个基准测试中表现出色，超越了大多数开源模型，并在某些任务上展现出与专有模型相当的竞争力。Qwen2-7B-Instruct 在多项评测中均优于 Qwen1.5-7B-Chat，显示出显著的性能提升',
    displayName: 'Qwen2 7B Instruct (Pro)',
    id: 'Pro/Qwen/Qwen2-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.35,
      output: 0.35,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2-VL 是 Qwen-VL 模型的最新迭代版本，在视觉理解基准测试中达到了最先进的性能，包括 MathVista、DocVQA、RealWorldQA 和 MTVQA 等。Qwen2-VL 能够理解超过 20 分钟的视频，用于高质量的基于视频的问答、对话和内容创作。它还具备复杂推理和决策能力，可以与移动设备、机器人等集成，基于视觉环境和文本指令进行自动操作。除了英语和中文，Qwen2-VL 现在还支持理解图像中不同语言的文本，包括大多数欧洲语言、日语、韩语、阿拉伯语和越南语等',
    displayName: 'Qwen2 VL 72B Instruct',
    id: 'Qwen/Qwen2-VL-72B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 4.13,
      output: 4.13,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-VL 是 Qwen 系列的新成员，具备强大的视觉理解能力，能分析图像中的文本、图表和布局，并能理解长视频和捕捉事件，它可以进行推理、操作工具，支持多格式物体定位和生成结构化输出，优化了视频理解的动态分辨率与帧率训练，并提升了视觉编码器效率。',
    displayName: 'Qwen2.5 VL 7B Instruct (Pro)',
    id: 'Pro/Qwen/Qwen2.5-VL-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.35,
      output: 0.35,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen2.5-VL-32B-Instruct 是通义千问团队推出的多模态大模型，是 Qwen2.5-VL 系列的一部分。该模型不仅精通识别常见物体，还能分析图像中的文本、图表、图标、图形和布局。它可作为视觉智能体，能够推理并动态操控工具，具备使用电脑和手机的能力。此外，这个模型可以精确定位图像中的对象，并为发票、表格等生成结构化输出。相比前代模型 Qwen2-VL，该版本在数学和问题解决能力方面通过强化学习得到了进一步提升，响应风格也更符合人类偏好。',
    displayName: 'Qwen2.5 VL 32B Instruct',
    id: 'Qwen/Qwen2.5-VL-32B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 1.89,
      output: 1.89,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen2.5-VL 是 Qwen2.5 系列中的视觉语言模型。该模型在多方面有显著提升：具备更强的视觉理解能力，能够识别常见物体、分析文本、图表和布局；作为视觉代理能够推理并动态指导工具使用；支持理解超过 1 小时的长视频并捕捉关键事件；能够通过生成边界框或点准确定位图像中的物体；支持生成结构化输出，尤其适用于发票、表格等扫描数据。',
    displayName: 'Qwen2.5 VL 72B Instruct',
    id: 'Qwen/Qwen2.5-VL-72B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 4.13,
      output: 4.13,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'InternLM2.5-7B-Chat 是一个开源的对话模型，基于 InternLM2 架构开发。该 7B 参数规模的模型专注于对话生成任务，支持中英双语交互。模型采用了最新的训练技术，旨在提供流畅、智能的对话体验。InternLM2.5-7B-Chat 适用于各种对话应用场景，包括但不限于智能客服、个人助手等领域',
    displayName: 'InternLM2.5 7B Chat (Free)',
    id: 'internlm/internlm2_5-7b-chat',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
];

export const allModels = [...siliconcloudChatModels];

export default allModels;
