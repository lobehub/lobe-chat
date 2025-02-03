import { ModelProviderCard } from '@/types/llm';

// ref: https://novita.ai/models/llm
const Novita: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 64_000,
      description:
        'DeepSeek-R1 是 DeepSeek 团队的最新模型，专为高效处理复杂任务而设计，具备强大的上下文理解能力。',
      displayName: 'DeepSeek R1',
      enabled: true,
      id: 'deepseek/deepseek-r1',
      pricing: {
        currency: 'USD',
        input: 4,
        output: 4,
      },
    },
    {
      contextWindowTokens: 64_000,
      description:
        'DeepSeek-V3 是 DeepSeek 团队的最新模型，在指令遵循和编码能力上比前代有显著提升，特别适合技术文档生成和代码辅助。',
      displayName: 'DeepSeek V3',
      enabled: true,
      id: 'deepseek/deepseek_v3',
      pricing: {
        currency: 'USD',
        input: 0.89,
        output: 0.89,
      },
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Meta Llama 3.3 多语言大语言模型（LLM）针对多语言对话场景进行了优化，支持超过 20 种语言，在跨语言理解和翻译任务中表现优异。',
      displayName: 'Llama 3.3 70B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.3-70b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.39,
        output: 0.39,
      },
    },
    {
      contextWindowTokens: 16_384,
      description:
        'Meta 的最新模型系列 Llama 3.1，推出了多种尺寸和配置，8B 版本在保持高性能的同时，具有更低的资源消耗，适合中小型应用场景。',
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-8b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.05,
        output: 0.05,
      },
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Mistral 与 NVIDIA 合作开发的 12B 参数模型，具有 128k token 的上下文长度，特别适合处理长文档和复杂对话场景，在推理和决策任务中表现出色。',
      displayName: 'Mistral Nemo',
      enabled: true,
      id: 'mistralai/mistral-nemo',
      pricing: {
        currency: 'USD',
        input: 0.17,
        output: 0.17,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'Sao10K/L3-8B-Stheno-v3.2 是一个高度熟练的模型，能够完全融入任何指定的角色，特别适合角色扮演游戏和创意写作，具有丰富的表现力和情感理解能力。',
      displayName: 'L3 8B Stheno V3.2',
      enabled: true,
      id: 'Sao10K/L3-8B-Stheno-v3.2',
      pricing: {
        currency: 'USD',
        input: 0.05,
        output: 0.05,
      },
    },
    {
      contextWindowTokens: 4096,
      description:
        '该模型合并的理念是每一层由多个张量组成，这些张量分别负责特定功能，通过模块化设计实现了更高的灵活性和效率，在特定任务中表现优异。',
      displayName: 'Mythomax L2 13B',
      enabled: true,
      id: 'gryphe/mythomax-l2-13b',
      pricing: {
        currency: 'USD',
        input: 0.09,
        output: 0.09,
      },
    },
    {
      contextWindowTokens: 32_000,
      description:
        'Qwen2.5 是 Qwen 大语言模型系列的最新版本，具备更强的上下文处理能力和更广泛的知识覆盖，特别适合复杂对话和知识密集型任务。',
      displayName: 'Qwen 2.5 72B Instruct',
      enabled: true,
      id: 'qwen/qwen-2.5-72b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.38,
        output: 0.4,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2 是 Qwen 大语言模型系列的最新版本，在保持高性能的同时，优化了资源利用率，适合大规模部署和实时应用场景。',
      displayName: 'Qwen2 72B Instruct',
      enabled: true,
      id: 'qwen/qwen-2-72b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.34,
        output: 0.39,
      },
    },
    {
      contextWindowTokens: 4096,
      description:
        'OpenChat 7B 是一个开源语言模型库，使用 "C-RLFT" 策略进行微调，特别适合对话系统和聊天机器人开发，具有高度的可定制性和灵活性。',
      displayName: 'OpenChat 7B',
      enabled: true,
      id: 'openchat/openchat-7b',
      pricing: {
        currency: 'USD',
        input: 0.06,
        output: 0.06,
      },
    },
    {
      contextWindowTokens: 16_000,
      description:
        '未审查的 llama3 模型是创造力的强大引擎，在角色扮演和故事写作方面表现出色，特别适合需要高度创意和自由度的应用场景。',
      displayName: 'L3 70B Euryale V2.1',
      enabled: true,
      id: 'sao10k/l3-70b-euryale-v2.1',
      pricing: {
        currency: 'USD',
        input: 1.48,
        output: 1.48,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Meta 的最新模型系列 Llama 3.1，70B 指令微调版本针对高质量对话场景进行了优化。在人工评估中，相比领先的闭源模型表现出色。',
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-70b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.34,
        output: 0.39,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'Hermes 2 Pro 是 Nous Hermes 2 的升级版本，使用了更新和清理后的 OpenHermes 2.5 数据集，并引入了内部开发的函数调用和 JSON 模式数据集。',
      displayName: 'Hermes 2 Pro Llama 3 8B',
      enabled: true,
      id: 'nousresearch/hermes-2-pro-llama-3-8b',
      pricing: {
        currency: 'USD',
        input: 0.14,
        output: 0.14,
      },
    },
    {
      contextWindowTokens: 16_000,
      description:
        'Dolphin 2.9 专为指令遵循、对话和编程而设计。这是 Mixtral 8x22B Instruct 的微调版本。它具有 64k 上下文长度，使用 16k 序列长度和 ChatML 模板进行微调。',
      displayName: 'Dolphin Mixtral 8x22B',
      enabled: true,
      id: 'cognitivecomputations/dolphin-mixtral-8x22b',
      pricing: {
        currency: 'USD',
        input: 0.9,
        output: 0.9,
      },
    },
    {
      contextWindowTokens: 65_535,
      description:
        'WizardLM-2 8x22B 是微软 AI 最先进的 Wizard 模型。与领先的专有模型相比表现出极具竞争力的性能，并且始终优于所有现有的最先进开源模型。',
      displayName: 'Wizardlm 2 8x22B',
      enabled: true,
      id: 'microsoft/wizardlm-2-8x22b',
      pricing: {
        currency: 'USD',
        input: 0.62,
        output: 0.62,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'Google 的 Gemma 2 9B 是一个先进的开源语言模型，在其规模类别中为效率和性能设立了新标准。专为各种任务设计，使开发者和研究人员能够构建创新应用，同时保持可访问性、安全性和成本效益。',
      displayName: 'Gemma 2 9B',
      enabled: true,
      id: 'google/gemma-2-9b-it',
      pricing: {
        currency: 'USD',
        input: 0.08,
        output: 0.08,
      },
    },
    {
      contextWindowTokens: 32_768,
      description: '一个高性能的工业标准 7.3B 参数模型，针对速度和上下文长度进行了优化。',
      displayName: 'Mistral 7B Instruct',
      enabled: true,
      id: 'mistralai/mistral-7b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.059,
        output: 0.059,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'Meta 最新的模型系列 (Llama 3) 推出了多种规格和版本。这个 70B 指令微调版本针对高质量对话场景进行了优化。在人工评估中与领先的闭源模型相比表现出色。',
      displayName: 'Llama3 70b Instruct',
      enabled: true,
      id: 'meta-llama/llama-3-70b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.51,
        output: 0.74,
      },
    },
    {
      contextWindowTokens: 131_000,
      description:
        'Meta Llama 3.2 系列多语言大语言模型（LLM）是一个预训练和指令微调的生成式模型集合，提供 1B 和 3B 两种规格（文本输入/输出）。',
      displayName: 'Llama 3.2 1B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.2-1b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.02,
        output: 0.02,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Llama 3.2 11B Vision 是一个具有 110 亿参数的多模态模型，专为处理视觉和文本数据的任务而设计。它在图像描述和视觉问答等任务中表现出色，弥合了语言生成和视觉推理之间的差距。',
      displayName: 'Llama 3.2 11B Vision Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.2-11b-vision-instruct',
      pricing: {
        currency: 'USD',
        input: 0.06,
        output: 0.06,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Meta Llama 3.2 系列多语言大语言模型（LLM）是一个预训练和指令微调的生成式模型集合，提供 1B 和 3B 两种规格（文本输入/输出）。',
      displayName: 'Llama 3.2 3B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.2-3b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.03,
        output: 0.05,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'Meta 最新的模型系列 Llama 3.1，8B 指令微调版本特别快速和高效。它在人工评估中表现出色，超越了几个领先的闭源模型。',
      displayName: 'Llama 3.1 8B Instruct BF16',
      enabled: true,
      id: 'meta-llama/llama-3.1-8b-instruct-bf16',
      pricing: {
        currency: 'USD',
        input: 0.06,
        output: 0.06,
      },
    },
    {
      contextWindowTokens: 16_000,
      description:
        'Euryale L3.1 70B v2.2 是 Sao10k 专注于创意角色扮演的模型。它是 Euryale L3 70B v2.1 的后续版本。',
      displayName: 'L31 70B Euryale V2.2',
      enabled: true,
      id: 'sao10k/l31-70b-euryale-v2.2',
      pricing: {
        currency: 'USD',
        input: 1.48,
        output: 1.48,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2 是 Qwen 大语言模型家族中最新的系列。Qwen2 7B 是一个基于 transformer 的模型，在语言理解、多语言能力、编程、数学和推理方面表现出色。',
      displayName: 'Qwen 2 7B Instruct',
      enabled: true,
      id: 'qwen/qwen-2-7b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.054,
        output: 0.054,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Qwen2 VL 72B 是 Qwen 团队的多模态大语言模型，具有以下主要增强功能：\n\n在各种分辨率和比例的图像理解方面达到最先进水平：Qwen2-VL 在视觉理解基准测试中达到了最先进的性能，包括 MathVista、DocVQA、RealWorldQA、MTVQA 等。\n\n能够理解 20 分钟以上的视频：Qwen2-VL 可以理解超过 20 分钟的视频，用于高质量的视频问答、对话、内容创作等。\n\n可以操作您的手机、机器人等设备：凭借复杂推理和决策能力，Qwen2-VL 可以与手机、机器人等设备集成，基于视觉环境和文本指令进行自动操作。\n\n多语言支持：为服务全球用户，除了英语和中文，Qwen2-VL 现在支持理解图像中的不同语言文本，包括大多数欧洲语言、日语、韩语、阿拉伯语、越南语等。',
      displayName: 'Qwen 2 VL 72B Instruct',
      enabled: true,
      id: 'qwen/qwen-2-vl-72b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.45,
        output: 0.45,
      },
    },
    {
      contextWindowTokens: 8192,
      description: '基于 Llama 3 的通用/角色扮演模型合并。',
      displayName: 'Sao10k L3 8B Lunaris',
      enabled: true,
      id: 'sao10k/l3-8b-lunaris',
      pricing: {
        currency: 'USD',
        input: 0.05,
        output: 0.05,
      },
    },
    {
      contextWindowTokens: 16_384,
      description:
        'Meta 最新的模型系列 Llama 3.1，8B 指令微调版本特别快速和高效。它在人工评估中表现出色，超越了几个领先的闭源模型。',
      displayName: 'Llama3.1 8B Instruct Max',
      enabled: true,
      id: 'meta-llama/llama-3.1-8b-instruct-max',
      pricing: {
        currency: 'USD',
        input: 0.05,
        output: 0.05,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'Meta 最新的模型系列 (Llama 3) 推出了多种规格和版本。这个 8B 指令微调版本针对高质量对话场景进行了优化。在人工评估中与领先的闭源模型相比表现出色。',
      displayName: 'Llama 3 8B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3-8b-instruct',
      pricing: {
        currency: 'USD',
        input: 0.04,
        output: 0.04,
      },
    },
  ],
  checkModel: 'meta-llama/llama-3.1-8b-instruct',
  description:
    'Novita AI 是一个提供多种大语言模型与 AI 图像生成的 API 服务的平台，灵活、可靠且具有成本效益。它支持 DeepSeek、Llama3、Mistral 等最新的开源模型，并为生成式 AI 应用开发提供了全面、用户友好且自动扩展的 API 解决方案，适合 AI 初创公司的快速发展。',
  disableBrowserRequest: true,
  id: 'novita',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://novita.ai/models/llm',
  name: 'Novita',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://novita.ai',
};

export default Novita;
