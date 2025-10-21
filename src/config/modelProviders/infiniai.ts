import { ModelProviderCard } from '@/types/llm';

// https://cloud.infini-ai.com/genstudio/model
// All models are currently free
const InfiniAI: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 65_536,
      description:
        'DeepSeek-R1 是一个专注于推理能力的大语言模型，通过创新的训练流程实现了与 OpenAI-o1 相当的数学、代码和推理任务表现。该模型采用了冷启动数据和大规模强化学习相结合的方式进行训练。',
      displayName: 'DeepSeek R1',
      enabled: true,
      id: 'deepseek-r1',
    },
    {
      contextWindowTokens: 65_536,
      description:
        'DeepSeek-V3 是一个强大的专家混合（MoE）语言模型，总参数量为 671B，每个 Token 激活 37B 参数。该模型采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，实现了高效推理和经济训练。',
      displayName: 'DeepSeek V3',
      enabled: true,
      id: 'deepseek-v3',
    },
    {
      contextWindowTokens: 65_536,
      description:
        'QwQ 是 Qwen 系列的推理模型，相比传统指令调优模型，QwQ 具备思考和推理能力，在下游任务尤其是难题上能取得显著性能提升。QwQ-32B 是一款中等规模的推理模型，其性能可与最先进的推理模型相媲美，例如 DeepSeek-R1 和 o1-mini。',
      displayName: 'QwQ',
      enabled: true,
      id: 'qwq-32b',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'DeepSeek-R1-Distill-Qwen-32B 是基于 DeepSeek-R1 蒸馏而来的模型，在 Qwen2.5-32B 的基础上使用 DeepSeek-R1 生成的样本进行微调。该模型在各种基准测试中表现出色，保持了强大的推理能力。',
      displayName: 'DeepSeek R1 Distill Qwen 32B',
      enabled: true,
      id: 'deepseek-r1-distill-qwen-32b',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
      displayName: 'Qwen2.5 72B Instruct',
      enabled: true,
      id: 'qwen2.5-72b-instruct',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
      displayName: 'Qwen2.5 32B Instruct',
      enabled: true,
      id: 'qwen2.5-32b-instruct',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2.5-Coder 是最新的代码专用 Qwen 大型语言模型系列。Qwen2.5-Coder 在 CodeQwen1.5 的基础上带来了以下改进：\n显著提升代码生成、代码推理和代码修复能力。\n支持真实世界应用，例如代码代理，增强编码能力和数学及一般能力。\n支持长上下文处理。',
      displayName: 'Qwen2.5 Coder 32B Instruct',
      enabled: true,
      id: 'qwen2.5-coder-32b-instruct',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
      displayName: 'Qwen2.5 14B Instruct',
      enabled: true,
      id: 'qwen2.5-14b-instruct',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2.5 是 Qwen 大型语言模型系列的最新成果。Qwen2.5 发布了从 0.5 到 720 亿参数不等的基础语言模型及指令调优语言模型。Qwen2.5 相比 Qwen2 带来了以下改进：\n显著增加知识量，在编程与数学领域的能力得到极大提升。\n在遵循指令、生成长文本、理解结构化数据 (例如，表格) 以及生成结构化输出特别是 JSON 方面有显著提升。对系统提示的多样性更具韧性，增强了聊天机器人中的角色扮演实现和条件设定。\n支持长上下文处理。\n支持超过 29 种语言的多语言功能，包括中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语、俄语、日语、韩语、越南语、泰语、阿拉伯语等。',
      displayName: 'Qwen2.5 7B Instruct',
      enabled: true,
      id: 'qwen2.5-7b-instruct',
    },
  ],
  checkModel: 'qwen3-8b',
  description:
    '为应用开发者提供高性能、易上手、安全可靠的大模型服务，覆盖从大模型开发到大模型服务化部署的全流程。',
  id: 'infiniai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://cloud.infini-ai.com/genstudio/model',
  name: 'InfiniAI',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://cloud.infini-ai.com/maas/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://cloud.infini-ai.com/genstudio',
};

export default InfiniAI;
