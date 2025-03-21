import { AIChatModelCard } from '@/types/aiModel';

// https://cloud.infini-ai.com/genstudio/model
// All models are currently free

const infiniaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-R1 是一个专注于推理能力的大语言模型，通过创新的训练流程实现了与 OpenAI-o1 相当的数学、代码和推理任务表现。该模型采用了冷启动数据和大规模强化学习相结合的方式进行训练。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一个强大的专家混合（MoE）语言模型，总参数量为 671B，每个 Token 激活 37B 参数。该模型采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，实现了高效推理和经济训练。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 65_536,
    description:
      'QwQ 是 Qwen 系列的推理模型，相比传统指令调优模型，QwQ 具备思考和推理能力，在下游任务尤其是难题上能取得显著性能提升。QwQ-32B 是一款中等规模的推理模型，其性能可与最先进的推理模型相媲美，例如 DeepSeek-R1 和 o1-mini。',
    displayName: 'QwQ 32B',
    enabled: true,
    id: 'qwq-32b',
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
      'DeepSeek-R1-Distill-Qwen-32B 是基于 DeepSeek-R1 蒸馏而来的模型，在 Qwen2.5-32B 的基础上使用 DeepSeek-R1 生成的样本进行微调。该模型在各种基准测试中表现出色，保持了强大的推理能力。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    enabled: true,
    id: 'deepseek-r1-distill-qwen-32b',
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
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 72B Instruct',
    enabled: true,
    id: 'qwen2.5-72b-instruct',
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
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 32B Instruct',
    enabled: true,
    id: 'qwen2.5-32b-instruct',
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
      'Qwen2.5-Coder 是最新的代码专用 Qwen 大型语言模型系列。Qwen2.5-Coder 在 CodeQwen1.5 的基础上带来了以下改进：\n显著提升代码生成、代码推理和代码修复能力。\n支持真实世界应用，例如代码代理，增强编码能力和数学及一般能力。\n支持长上下文处理。',
    displayName: 'Qwen2.5 Coder 32B Instruct',
    enabled: true,
    id: 'qwen2.5-coder-32b-instruct',
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
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 14B Instruct',
    enabled: true,
    id: 'qwen2.5-14b-instruct',
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
      'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
    displayName: 'Qwen2.5 7B Instruct',
    enabled: true,
    id: 'qwen2.5-7b-instruct',
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
      'Meta 发布的 LLaMA 3.3 多语言大规模语言模型（LLMs）是一个经过预训练和指令微调的生成模型，提供 70B 规模（文本输入/文本输出）。该模型使用超过 15T 的数据进行训练，支持英语、德语、法语、意大利语、葡萄牙语、印地语、西班牙语和泰语，知识更新截止于 2023 年 12 月。',
    displayName: 'LLaMA 3.3 70B',
    enabled: true,
    id: 'llama-3.3-70b-instruct',
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
      'Qwen2 是 Qwen 团队推出的新一代大型语言模型系列。它基于 Transformer 架构，并采用 SwiGLU 激活函数、注意力 QKV 偏置(attention QKV bias)、群组查询注意力(group query attention)、滑动窗口注意力(mixture of sliding window attention)与全注意力的混合等技术。此外，Qwen 团队还改进了适应多种自然语言和代码的分词器。',
    displayName: 'Qwen 2 72B Instruct',
    enabled: true,
    id: 'qwen2-72b-instruct',
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
      'Qwen2 是 Qwen 团队推出的新一代大型语言模型系列。它基于 Transformer 架构，并采用 SwiGLU 激活函数、注意力 QKV 偏置(attention QKV bias)、群组查询注意力(group query attention)、滑动窗口注意力(mixture of sliding window attention)与全注意力的混合等技术。此外，Qwen 团队还改进了适应多种自然语言和代码的分词器。',
    displayName: 'Qwen 2 7B Instruct',
    enabled: true,
    id: 'qwen2-7b-instruct',
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
      'Yi-1.5 是 Yi 的升级版本。 它使用 500B Tokens 的高质量语料库在 Yi 上持续进行预训练，并在 3M 个多样化的微调样本上进行微调。',
    displayName: 'Yi-1.5 34B Chat',
    enabled: true,
    id: 'yi-1.5-34b-chat',
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
      'Qwen1.5 系列是 Qwen2 的 Beta 版本，是一个基于 Transformer 的仅解码语言模型，在海量数据上进行预训练。与之前发布的 Qwen 系列版本相比，Qwen1.5 系列 base 与 chat 模型均能支持多种语言，在整体聊天和基础能力上都得到了提升。Qwen1.5-72b-chat 是其中专用于 chat 场景的 720 亿参数的大模型。',
    displayName: 'Qwen1.5 72B Chat',
    enabled: true,
    id: 'qwen1.5-72b-chat',
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
      'Qwen1.5 系列是 Qwen2 的 Beta 版本，是一个基于 Transformer 的仅解码语言模型，在海量数据上进行预训练。与之前发布的 Qwen 系列版本相比，Qwen1.5 系列 base 与 chat 模型均能支持多种语言，在整体聊天和基础能力上都得到了提升。Qwen1.5-32b-chat 是其中专用于 chat 场景的 320 亿参数的大模型，较于 14b 模型在智能体场景更强，较于 72b 模型推理成本更低。',
    displayName: 'Qwen1.5 32B Chat',
    enabled: true,
    id: 'qwen1.5-32b-chat',
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
      'Qwen1.5 系列是 Qwen2 的 Beta 版本，是一个基于 Transformer 的仅解码语言模型，在海量数据上进行预训练。与之前发布的 Qwen 系列版本相比，Qwen1.5 系列 base 与 chat 模型均能支持多种语言，在整体聊天和基础能力上都得到了提升。Qwen1.5-14b-chat 是其中专用于 chat 场景的 140 亿参数的主流大小模型。',
    displayName: 'Qwen1.5 14B Chat',
    enabled: true,
    id: 'qwen1.5-14b-chat',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: 'GLM-4-9B-Chat 是智谱 AI 推出的最新一代预训练模型 GLM-4-9B 的人类偏好对齐版本。',
    displayName: 'GLM-4 9B Chat',
    enabled: true,
    id: 'glm-4-9b-chat',
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
      'ChatGLM3 是智谱 AI 与清华 KEG 实验室发布的闭源模型，经过海量中英标识符的预训练与人类偏好对齐训练，相比一代模型在 MMLU、C-Eval、GSM8K 分别取得了 16%、36%、280% 的提升，并登顶中文任务榜单 C-Eval。适用于对知识量、推理能力、创造力要求较高的场景，比如广告文案、小说写作、知识类写作、代码生成等。',
    displayName: 'ChatGLM3',
    enabled: true,
    id: 'chatglm3',
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
      'ChatGLM3-6b-base 是由智谱开发的 ChatGLM 系列最新一代的 60 亿参数规模的开源的基础模型。',
    displayName: 'ChatGLM3 6B Base',
    enabled: true,
    id: 'chatglm3-6b-base',
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
      'Llama2 是由 Meta 开发并开源的大型语言模型（LLM）系列，这是一组从 70 亿到 700 亿参数不同规模、经过预训练和微调的生成式文本模型。架构层面，LLama2 是一个使用优化型转换器架构的自动回归语言模型。调整后的版本使用有监督的微调（SFT）和带有人类反馈的强化学习（RLHF）以对齐人类对有用性和安全性的偏好。Llama2 较 Llama 系列在多种学术数据集上有着更加不俗的表现，为大量其他模型提供了设计和开发的思路。',
    displayName: 'Llama 2 7B Chat',
    enabled: true,
    id: 'llama-2-7b-chat',
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
      'Megrez-3B-Instruct 是由无问芯穹完全自主训练的大语言模型。Megrez-3B-Instruct 旨在通过软硬协同理念，打造一款极速推理、小巧精悍、极易上手的端侧智能解决方案。',
    displayName: 'Megrez 3B Instruct',
    enabled: true,
    id: 'megrez-3b-instruct',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
];

export const allModels = [...infiniaiChatModels];

export default allModels;
