import { AIChatModelCard } from '@/types/aiModel';

const siliconcloudChatModels: AIChatModelCard[] = [
  {
    abilities: {
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
    enabled: true,
    id: 'deepseek-ai/DeepSeek-V3',
    pricing: { // 2.9 涨价
      currency: 'CNY',
      input: 1,
      output: 2,
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
      input: 5,
      output: 5,
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
      'QwQ-32B-Preview是Qwen 最新的实验性研究模型，专注于提升AI推理能力。通过探索语言混合、递归推理等复杂机制，主要优势包括强大的推理分析能力、数学和编程能力。与此同时，也存在语言切换问题、推理循环、安全性考虑、其他能力方面的差异。',
    displayName: 'QwQ 32B Preview',
    enabled: true,
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
    enabled: true,
    id: 'Qwen/Qwen2.5-7B-Instruct',
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
      'Qwen2.5-7B-Instruct 是阿里云发布的最新大语言模型系列之一。该 7B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 7B Instruct (LoRA)',
    id: 'LoRA/Qwen/Qwen2.5-7B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.53,
      output: 0.53,
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
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一。该 72B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升',
    displayName: 'Qwen2.5 72B Instruct (LoRA)',
    id: 'LoRA/Qwen/Qwen2.5-72B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 6.2,
      output: 6.2,
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
    enabled: true,
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
    enabled: true,
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
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'InternVL2-8B 是 InternVL 2.0 系列多模态大语言模型中的一员。该模型由 InternViT-300M-448px 视觉模型、MLP 投影层和 internlm2_5-7b-chat 语言模型组成。它在各种视觉语言任务上展现出了卓越的性能，包括文档和图表理解、场景文本理解、OCR、科学和数学问题解决等。InternVL2-8B 使用 8K 上下文窗口训练，能够处理长文本、多图像和视频输入，显著提升了模型在这些任务上的处理能力',
    displayName: 'InternVL2 8B (Pro)',
    id: 'Pro/OpenGVLab/InternVL2-8B',
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
      'InternVL2-26B 是 InternVL 2.0 系列多模态大语言模型中的一员。该模型由 InternViT-6B-448px-V1-5 视觉模型、MLP 投影层和 internlm2-chat-20b 语言模型组成。它在各种视觉语言任务上展现出了卓越的性能，包括文档和图表理解、场景文本理解、OCR、科学和数学问题解决等。InternVL2-26B 使用 8K 上下文窗口训练，能够处理长文本、多图像和视频输入，显著提升了模型在这些任务上的处理能力',
    displayName: 'InternVL2 26B',
    id: 'OpenGVLab/InternVL2-26B',
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
    contextWindowTokens: 4096,
    description:
      'Yi-1.5-6B-Chat 是 Yi-1.5 系列的一个变体，属于开源聊天模型。Yi-1.5 是 Yi 的升级版本，在 500B 个高质量语料上进行了持续预训练，并在 3M 多样化的微调样本上进行了微调。相比于 Yi，Yi-1.5 在编码、数学、推理和指令遵循能力方面表现更强，同时保持了出色的语言理解、常识推理和阅读理解能力。该模型具有 4K、16K 和 32K 的上下文长度版本，预训练总量达到 3.6T 个 token',
    displayName: 'Yi-1.5 6B Chat (Free)',
    id: '01-ai/Yi-1.5-6B-Chat',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description:
      'Yi-1.5-9B-Chat-16K 是 Yi-1.5 系列的一个变体，属于开源聊天模型。Yi-1.5 是 Yi 的升级版本，在 500B 个高质量语料上进行了持续预训练，并在 3M 多样化的微调样本上进行了微调。相比于 Yi，Yi-1.5 在编码、数学、推理和指令遵循能力方面表现更强，同时保持了出色的语言理解、常识推理和阅读理解能力。该模型在同等规模的开源模型中表现最佳',
    displayName: 'Yi-1.5 9B Chat 16K (Free)',
    id: '01-ai/Yi-1.5-9B-Chat-16K',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description:
      'Yi-1.5-34B-Chat-16K 是 Yi-1.5 系列的一个变体，属于开源聊天模型。Yi-1.5 是 Yi 的升级版本，在 500B 个高质量语料上进行了持续预训练，并在 3M 多样化的微调样本上进行了微调。相比于 Yi，Yi-1.5 在编码、数学、推理和指令遵循能力方面表现更强，同时保持了出色的语言理解、常识推理和阅读理解能力。该模型在大多数基准测试中与更大的模型相当或表现更佳，具有 16K 的上下文长度',
    displayName: 'Yi-1.5 34B Chat 16K',
    id: '01-ai/Yi-1.5-34B-Chat-16K',
    pricing: {
      currency: 'CNY',
      input: 1.26,
      output: 1.26,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Gemma 是 Google 开发的轻量级、最先进的开放模型系列之一。它是一个仅解码器的大型语言模型，支持英语，提供开放权重、预训练变体和指令微调变体。Gemma 模型适用于各种文本生成任务，包括问答、摘要和推理。该 9B 模型是通过 8 万亿个 tokens 训练而成。其相对较小的规模使其可以在资源有限的环境中部署，如笔记本电脑、台式机或您自己的云基础设施，从而使更多人能够访问最先进的 AI 模型并促进创新',
    displayName: 'Gemma 2 9B (Free)',
    enabled: true,
    id: 'google/gemma-2-9b-it',
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
      'Gemma 是 Google 开发的轻量级、最先进的开放模型系列之一。它是一个仅解码器的大型语言模型，支持英语，提供开放权重、预训练变体和指令微调变体。Gemma 模型适用于各种文本生成任务，包括问答、摘要和推理。该 9B 模型是通过 8 万亿个 tokens 训练而成。其相对较小的规模使其可以在资源有限的环境中部署，如笔记本电脑、台式机或您自己的云基础设施，从而使更多人能够访问最先进的 AI 模型并促进创新',
    displayName: 'Gemma 2 9B (Pro)',
    id: 'Pro/google/gemma-2-9b-it',
    pricing: {
      currency: 'CNY',
      input: 0.6,
      output: 0.6,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Gemma 是由 Google 开发的轻量级、最先进的开放模型系列，采用与 Gemini 模型相同的研究和技术构建。这些模型是仅解码器的大型语言模型，支持英语，提供预训练和指令微调两种变体的开放权重。Gemma 模型适用于各种文本生成任务，包括问答、摘要和推理。其相对较小的规模使其能够部署在资源有限的环境中，如笔记本电脑、台式机或个人云基础设施，从而让所有人都能获得最先进的 AI 模型，促进创新',
    displayName: 'Gemma 2 27B',
    id: 'google/gemma-2-27b-it',
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
      'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调变体。该 8B 指令微调模型针对多语言对话场景进行了优化，在多项行业基准测试中表现优异。模型训练使用了超过 15 万亿个 tokens 的公开数据，并采用了监督微调和人类反馈强化学习等技术来提升模型的有用性和安全性。Llama 3.1 支持文本生成和代码生成，知识截止日期为 2023 年 12 月',
    displayName: 'Llama 3.1 8B Instruct (Free)',
    enabled: true,
    id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
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
      'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调变体。该 8B 指令微调模型针对多语言对话场景进行了优化，在多项行业基准测试中表现优异。模型训练使用了超过 15 万亿个 tokens 的公开数据，并采用了监督微调和人类反馈强化学习等技术来提升模型的有用性和安全性。Llama 3.1 支持文本生成和代码生成，知识截止日期为 2023 年 12 月',
    displayName: 'Llama 3.1 8B Instruct (Pro)',
    id: 'Pro/meta-llama/Meta-Llama-3.1-8B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 0.42,
      output: 0.42,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调变体。该 70B 指令微调模型针对多语言对话场景进行了优化，在多项行业基准测试中表现优异。模型训练使用了超过 15 万亿个 tokens 的公开数据，并采用了监督微调和人类反馈强化学习等技术来提升模型的有用性和安全性。Llama 3.1 支持文本生成和代码生成，知识截止日期为 2023 年 12 月',
    displayName: 'Llama 3.1 70B Instruct',
    id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
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
      'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调变体。该 405B 指令微调模型针对多语言对话场景进行了优化，在多项行业基准测试中表现优异。模型训练使用了超过 15 万亿个 tokens 的公开数据，并采用了监督微调和人类反馈强化学习等技术来提升模型的有用性和安全性。Llama 3.1 支持文本生成和代码生成，知识截止日期为 2023 年 12 月',
    displayName: 'Llama 3.1 405B Instruct',
    enabled: true,
    id: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 21,
      output: 21,
    },
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
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    pricing: {
      currency: 'CNY',
      input: 4.13,
      output: 4.13,
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
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'TeleMM多模态大模型是由中国电信自主研发的多模态理解大模型，能够处理文本、图像等多种模态输入，支持图像理解、图表分析等功能，为用户提供跨模态的理解服务。模型能够与用户进行多模态交互，准确理解输入内容，回答问题、协助创作，并高效提供多模态信息和灵感支持。在细粒度感知，逻辑推理等多模态任务上有出色表现',
    displayName: 'TeleMM',
    id: 'TeleAI/TeleMM',
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
