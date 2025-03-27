import { AIChatModelCard } from '@/types/aiModel';

// https://siliconflow.cn/zh-cn/models

const siliconcloudChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-R1 是一款强化学习（RL）驱动的推理模型，解决了模型中的重复性和可读性问题。在 RL 之前，DeepSeek-R1 引入了冷启动数据，进一步优化了推理性能。它在数学、代码和推理任务中与 OpenAI-o1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
    displayName: 'DeepSeek R1',
    enabled: true,
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
    contextWindowTokens: 65_536,
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
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款拥有 6710 亿参数的混合专家（MoE）语言模型，采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，结合无辅助损失的负载平衡策略，优化推理和训练效率。通过在 14.8 万亿高质量tokens上预训练，并进行监督微调和强化学习，DeepSeek-V3 在性能上超越其他开源模型，接近领先闭源模型。',
    displayName: 'DeepSeek V3 1226 (Pro)',
    id: 'Pro/deepseek-ai/DeepSeek-V3-1226', // 将于 2025 年 4 月 30 日废弃
    pricing: { 
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true
    },
    contextWindowTokens: 32_768,
    description: 
      "DeepSeek-R1-Distill-Qwen-32B 是基于 Qwen2.5-32B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在数学、编程和推理等多个领域展现出卓越的性能。在 AIME 2024、MATH-500、GPQA Diamond 等多个基准测试中都取得了优异成绩，其中在 MATH-500 上达到了 94.3% 的准确率，展现出强大的数学推理能力。",
    displayName: "DeepSeek R1 Distill Qwen 32B",
    id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    pricing: {
      currency: "CNY",
      input: 1.26,
      output: 1.26
    },
    type: "chat"
  },
  {
    abilities: {
      reasoning: true
    },
    contextWindowTokens: 32_768,
    description: 
      "DeepSeek-R1-Distill-Qwen-14B 是基于 Qwen2.5-14B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力。在多个基准测试中表现出色，其中在 MATH-500 上达到了 93.9% 的准确率，在 AIME 2024 上达到了 69.7% 的通过率，在 CodeForces 上获得了 1481 的评分，显示出在数学和编程领域的强大实力。",
    displayName: "DeepSeek R1 Distill Qwen 14B",
    id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
    pricing: {
      currency: "CNY",
      input: 0.7,
      output: 0.7
    },
    type: "chat"
  },
  {
    abilities: {
      reasoning: true
    },
    contextWindowTokens: 32_768,
    description: 
      "DeepSeek-R1-Distill-Qwen-7B 是基于 Qwen2.5-Math-7B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力。在多个基准测试中表现出色，其中在 MATH-500 上达到了 92.8% 的准确率，在 AIME 2024 上达到了 55.5% 的通过率，在 CodeForces 上获得了 1189 的评分，作为 7B 规模的模型展示了较强的数学和编程能力。",
    displayName: "DeepSeek R1 Distill Qwen 7B (Free)",
    id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    pricing: {
      currency: "CNY",
      input: 0,
      output: 0
    },
    type: "chat",
  },
  {
    abilities: {
      reasoning: true
    },
    contextWindowTokens: 32_768,
    description: 
      "DeepSeek-R1-Distill-Qwen-1.5B 是基于 Qwen2.5-Math-1.5B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在多个基准测试中展现出不错的性能。作为一个轻量级模型，在 MATH-500 上达到了 83.9% 的准确率，在 AIME 2024 上达到了 28.9% 的通过率，在 CodeForces 上获得了 954 的评分，显示出超出其参数规模的推理能力。",
    displayName: "DeepSeek-R1-Distill-Qwen-1.5B (Free)",
    id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    pricing: {
      currency: "CNY",
      input: 0,
      output: 0
    },
    type: "chat"
  },
  {
    abilities: {
      reasoning: true
    },
    contextWindowTokens: 32_768,
    description: 
      "DeepSeek-R1-Distill-Qwen-7B 是基于 Qwen2.5-Math-7B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力。在多个基准测试中表现出色，其中在 MATH-500 上达到了 92.8% 的准确率，在 AIME 2024 上达到了 55.5% 的通过率，在 CodeForces 上获得了 1189 的评分，作为 7B 规模的模型展示了较强的数学和编程能力。",
    displayName: "DeepSeek R1 Distill Qwen 7B (Pro)",
    id: "Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    pricing: {
      currency: "CNY",
      input: 0.35,
      output: 0.35
    },
    type: "chat",
  },
  {
    abilities: {
      reasoning: true
    },
    contextWindowTokens: 32_768,
    description: 
      "DeepSeek-R1-Distill-Qwen-1.5B 是基于 Qwen2.5-Math-1.5B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在多个基准测试中展现出不错的性能。作为一个轻量级模型，在 MATH-500 上达到了 83.9% 的准确率，在 AIME 2024 上达到了 28.9% 的通过率，在 CodeForces 上获得了 954 的评分，显示出超出其参数规模的推理能力。",
    displayName: "DeepSeek-R1-Distill-Qwen-1.5B (Pro)",
    id: "Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    pricing: {
      currency: "CNY",
      input: 0.14,
      output: 0.14
    },
    type: "chat"
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
    enabled: true,
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
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'QwQ 是 Qwen 系列的推理模型。与传统的指令调优模型相比，QwQ 具备思考和推理能力，能够在下游任务中实现显著增强的性能，尤其是在解决困难问题方面。QwQ-32B 是中型推理模型，能够在与最先进的推理模型（如 DeepSeek-R1、o1-mini）的对比中取得有竞争力的性能。该模型采用 RoPE、SwiGLU、RMSNorm 和 Attention QKV bias 等技术，具有 64 层网络结构和 40 个 Q 注意力头（GQA 架构中 KV 为 8 个）。',
    displayName: 'QwQ 32B',
    enabled: true,
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
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'QwQ-32B-Preview 是 Qwen 最新的实验性研究模型，专注于提升AI推理能力。通过探索语言混合、递归推理等复杂机制，主要优势包括强大的推理分析能力、数学和编程能力。与此同时，也存在语言切换问题、推理循环、安全性考虑、其他能力方面的差异。',
    displayName: 'QwQ 32B Preview',
    id: 'Qwen/QwQ-32B-Preview',
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
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一。该 72B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 72B Instruct (Vendor-A)',
    id: 'Vendor-A/Qwen/Qwen2.5-72B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 1,
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
    enabled: true,
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
      'Qwen2-1.5B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 1.5B。该模型基于 Transformer 架构，采用了 SwiGLU 激活函数、注意力 QKV 偏置和组查询注意力等技术。它在语言理解、生成、多语言能力、编码、数学和推理等多个基准测试中表现出色，超越了大多数开源模型。与 Qwen1.5-1.8B-Chat 相比，Qwen2-1.5B-Instruct 在 MMLU、HumanEval、GSM8K、C-Eval 和 IFEval 等测试中均显示出显著的性能提升，尽管参数量略少',
    displayName: 'Qwen2 1.5B Instruct (Free)',
    id: 'Qwen/Qwen2-1.5B-Instruct',
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
      'Qwen2-1.5B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 1.5B。该模型基于 Transformer 架构，采用了 SwiGLU 激活函数、注意力 QKV 偏置和组查询注意力等技术。它在语言理解、生成、多语言能力、编码、数学和推理等多个基准测试中表现出色，超越了大多数开源模型。与 Qwen1.5-1.8B-Chat 相比，Qwen2-1.5B-Instruct 在 MMLU、HumanEval、GSM8K、C-Eval 和 IFEval 等测试中均显示出显著的性能提升，尽管参数量略少',
    displayName: 'Qwen2 1.5B Instruct (Pro)',
    id: 'Pro/Qwen/Qwen2-1.5B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.14,
      output: 0.14,
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
      'Qwen2-VL-7B-Instruct 是 Qwen-VL 模型的最新迭代版本，在视觉理解基准测试中达到了最先进的性能，包括 MathVista、DocVQA、RealWorldQA 和 MTVQA 等。Qwen2-VL 能够用于高质量的基于视频的问答、对话和内容创作，还具备复杂推理和决策能力，可以与移动设备、机器人等集成，基于视觉环境和文本指令进行自动操作。除了英语和中文，Qwen2-VL 现在还支持理解图像中不同语言的文本，包括大多数欧洲语言、日语、韩语、阿拉伯语和越南语等',
    displayName: 'Qwen2 VL 7B Instruct (Pro)',
    id: 'Pro/Qwen/Qwen2-VL-7B-Instruct',
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
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-VL 是 Qwen2.5 系列中的视觉语言模型。该模型在多方面有显著提升：具备更强的视觉理解能力，能够识别常见物体、分析文本、图表和布局；作为视觉代理能够推理并动态指导工具使用；支持理解超过 1 小时的长视频并捕捉关键事件；能够通过生成边界框或点准确定位图像中的物体；支持生成结构化输出，尤其适用于发票、表格等扫描数据。',
    displayName: 'Qwen2.5 VL 72B Instruct',
    enabled: true,
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
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'InternLM2.5-20B-Chat 是一个开源的大规模对话模型，基于 InternLM2 架构开发。该模型拥有 200 亿参数，在数学推理方面表现出色，超越了同量级的 Llama3 和 Gemma2-27B 模型。InternLM2.5-20B-Chat 在工具调用能力方面有显著提升，支持从上百个网页收集信息进行分析推理，并具备更强的指令理解、工具选择和结果反思能力。它适用于构建复杂智能体，可进行多轮工具调用以完成复杂任务',
    displayName: 'InternLM2.5 20B Chat',
    id: 'internlm/internlm2_5-20b-chat',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 1,
    },
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
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'ChatGLM3-6B 是 ChatGLM 系列的开源模型，由智谱 AI 开发。该模型保留了前代模型的优秀特性，如对话流畅和部署门槛低，同时引入了新的特性。它采用了更多样的训练数据、更充分的训练步数和更合理的训练策略，在 10B 以下的预训练模型中表现出色。ChatGLM3-6B 支持多轮对话、工具调用、代码执行和 Agent 任务等复杂场景。除对话模型外，还开源了基础模型 ChatGLM-6B-Base 和长文本对话模型 ChatGLM3-6B-32K。该模型对学术研究完全开放，在登记后也允许免费商业使用',
    displayName: 'ChatGLM3 6B (Free)',
    id: 'THUDM/chatglm3-6b',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'TeleChat2大模型是由中国电信从0到1自主研发的生成式语义大模型，支持百科问答、代码生成、长文生成等功能，为用户提供对话咨询服务，能够与用户进行对话互动，回答问题，协助创作，高效便捷地帮助用户获取信息、知识和灵感。模型在幻觉问题、长文生成、逻辑理解等方面均有较出色表现。',
    displayName: 'TeleChat2',
    id: 'TeleAI/TeleChat2',
    pricing: {
      currency: 'CNY',
      input: 1.33,
      output: 1.33,
    },
    type: 'chat',
  },
];

export const allModels = [...siliconcloudChatModels];

export default allModels;
