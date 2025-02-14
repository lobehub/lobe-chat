import { AIChatModelCard } from '@/types/aiModel';

const vllmChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true
    },
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
    displayName: 'Llama 3.1 70B',
    enabled: true,
    id: 'meta-llama/Meta-Llama-3.1-70B',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true
    },
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
    displayName: 'Llama 3.1 405B Instruct',
    id: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Gemma 2 是 Google 推出的高效模型，涵盖从小型应用到复杂数据处理的多种应用场景。',
    displayName: 'Gemma 2 9B',
    id: 'google/gemma-2-9b',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Gemma 2 是 Google 推出的高效模型，涵盖从小型应用到复杂数据处理的多种应用场景。',
    displayName: 'Gemma 2 27B',
    id: 'google/gemma-2-27b',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Mistral (7B) Instruct 以高性能著称，适用于多种语言任务。',
    displayName: 'Mistral 7B Instruct v0.1',
    id: 'mistralai/Mistral-7B-Instruct-v0.1',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Mixtral-8x7B Instruct (46.7B) 提供高容量的计算框架，适合大规模数据处理。',
    displayName: 'Mistral 8x7B Instruct v0.1',
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款拥有 6710 亿参数的混合专家（MoE）语言模型，采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，结合无辅助损失的负载平衡策略，优化推理和训练效率。通过在 14.8 万亿高质量tokens上预训练，并进行监督微调和强化学习，DeepSeek-V3 在性能上超越其他开源模型，接近领先闭源模型。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-V3',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true
    },
    contextWindowTokens: 32_768,
    description: 'Qwen QwQ 是由 Qwen 团队开发的实验研究模型，专注于提升AI推理能力。',
    displayName: 'QwQ 32B Preview',
    enabled: true,
    id: 'Qwen/QwQ-32B-Preview',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen2-7B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 7B。该模型基于 Transformer 架构，采用了 SwiGLU 激活函数、注意力 QKV 偏置和组查询注意力等技术。它能够处理大规模输入。该模型在语言理解、生成、多语言能力、编码、数学和推理等多个基准测试中表现出色，超越了大多数开源模型，并在某些任务上展现出与专有模型相当的竞争力。Qwen2-7B-Instruct 在多项评测中均优于 Qwen1.5-7B-Chat，显示出显著的性能提升',
    displayName: 'Qwen2 7B Instruct',
    enabled: true,
    id: 'Qwen/Qwen2-7B-Instruct',
    type: 'chat',
  },
]

export const allModels = [...vllmChatModels];

export default allModels;
