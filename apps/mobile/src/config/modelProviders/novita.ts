import { ModelProviderCard } from '@/types/llm';

// ref: https://novita.ai/model-api/product/llm-api
const Novita: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 8192,
      description:
        'Llama 3.1 8B Instruct 是 Meta 推出的最新版本，优化了高质量对话场景，表现优于许多领先的闭源模型。',
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-8b-instruct',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'Llama 3.1 70B Instruct 专为高质量对话而设计，在人类评估中表现突出，特别适合高交互场景。',
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-70b-instruct',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Llama 3.1 405B Instruct 是 Meta最新推出的版本，优化用于生成高质量对话，超越了许多领导闭源模型。',
      displayName: 'Llama 3.1 405B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-405b-instruct',
    },
    {
      contextWindowTokens: 8192,
      description: 'Llama 3 8B Instruct 优化了高质量对话场景，性能优于许多闭源模型。',
      displayName: 'Llama 3 8B Instruct',
      id: 'meta-llama/llama-3-8b-instruct',
    },
    {
      contextWindowTokens: 8192,
      description: 'Llama 3 70B Instruct 优化用于高质量对话场景，在各类人类评估中表现优异。',
      displayName: 'Llama 3 70B Instruct',
      id: 'meta-llama/llama-3-70b-instruct',
    },
    {
      contextWindowTokens: 8192,
      description: 'Gemma 2 9B 是谷歌的一款开源语言模型，以其在效率和性能方面设立了新的标准。',
      displayName: 'Gemma 2 9B',
      enabled: true,
      id: 'google/gemma-2-9b-it',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Mistral Nemo 是多语言支持和高性能编程的7.3B参数模型。',
      displayName: 'Mistral Nemo',
      enabled: true,
      id: 'mistralai/mistral-nemo',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Mistral 7B Instruct 是一款兼有速度优化和长上下文支持的高性能行业标准模型。',
      displayName: 'Mistral 7B Instruct',
      enabled: true,
      id: 'mistralai/mistral-7b-instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'WizardLM 2 7B 是微软AI最新的快速轻量化模型，性能接近于现有开源领导模型的10倍。',
      displayName: 'WizardLM 2 7B',
      enabled: true,
      id: 'microsoft/wizardlm 2-7b',
    },
    {
      contextWindowTokens: 65_535,
      description: 'WizardLM-2 8x22B 是微软AI最先进的Wizard模型，显示出极其竞争力的表现。',
      displayName: 'WizardLM-2 8x22B',
      enabled: true,
      id: 'microsoft/wizardlm-2-8x22b',
    },
    {
      contextWindowTokens: 16_000,
      description: 'Dolphin Mixtral 8x22B 是一款为指令遵循、对话和编程设计的模型。',
      displayName: 'Dolphin Mixtral 8x22B',
      id: 'cognitivecomputations/dolphin-mixtral-8x22b',
    },
    {
      contextWindowTokens: 8192,
      description:
        'Hermes 2 Pro Llama 3 8B 是 Nous Hermes 2的升级版本，包含最新的内部开发的数据集。',
      displayName: 'Hermes 2 Pro Llama 3 8B',
      id: 'nousresearch/hermes-2-pro-llama-3-8b',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Hermes 2 Mixtral 8x7B DPO 是一款高度灵活的多模型合并，旨在提供卓越的创造性体验。',
      displayName: 'Hermes 2 Mixtral 8x7B DPO',
      id: 'Nous-Hermes-2-Mixtral-8x7B-DPO',
    },
    {
      contextWindowTokens: 4096,
      description: 'MythoMax l2 13B 是一款合并了多个顶尖模型的创意与智能相结合的语言模型。',
      displayName: 'MythoMax l2 13B',
      id: 'gryphe/mythomax-l2-13b',
    },
    {
      contextWindowTokens: 4096,
      description: 'OpenChat 7B 是经过“C-RLFT（条件强化学习微调）”策略精调的开源语言模型库。',
      displayName: 'OpenChat 7B',
      id: 'openchat/openchat-7b',
    },
  ],
  checkModel: 'meta-llama/llama-3.1-8b-instruct',
  description:
    'Novita AI 是一个提供多种大语言模型与 AI 图像生成的 API 服务的平台，灵活、可靠且具有成本效益。它支持 Llama3、Mistral 等最新的开源模型，并为生成式 AI 应用开发提供了全面、用户友好且自动扩展的 API 解决方案，适合 AI 初创公司的快速发展。',
  disableBrowserRequest: true,
  id: 'novita',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://novita.ai/model-api/product/llm-api',
  name: 'Novita',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.novita.ai/v3/openai',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://novita.ai',
};

export default Novita;
