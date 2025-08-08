import { ModelProviderCard } from '@/types/llm';

// ref https://platform.sensenova.cn/pricing
// ref https://platform.sensenova.cn/release?path=/release-202409.md
const SenseNova: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 131_072,
      description:
        '最新版本模型 (V5.5)，128K上下文长度，在数学推理、英文对话、指令跟随以及长文本理解等领域能力显著提升，比肩GPT-4o',
      displayName: 'SenseChat 5.5',
      enabled: true,
      functionCall: true,
      id: 'SenseChat-5',
    },
    /*
    // Not compatible with local mode (Not support Base64 Image)
    {
      description: '最新版本模型 (V5.5)，16K上下文长度，支持多图的输入，全面实现模型基础能力优化，在对象属性识别、空间关系、动作事件识别、场景理解、情感识别、逻辑常识推理和文本理解生成上都实现了较大提升。',
      displayName: 'SenseChat 5.5 Vision',
      enabled: true,
      id: 'SenseChat-Vision',
      tokens: 16_384,
      vision: true,
    },
*/
    {
      contextWindowTokens: 32_768,
      description: '适用于快速问答、模型微调场景',
      displayName: 'SenseChat 5.0 Turbo',
      enabled: true,
      id: 'SenseChat-Turbo',
    },
    {
      contextWindowTokens: 32_768,
      description:
        '32K上下文长度，在粤语的对话理解上超越了GPT-4，在知识、推理、数学及代码编写等多个领域均能与GPT-4 Turbo相媲美',
      displayName: 'SenseChat 5.0 Cantonese',
      id: 'SenseChat-5-Cantonese',
    },
    {
      contextWindowTokens: 131_072,
      description: '基础版本模型 (V4)，128K上下文长度，在长文本理解及生成等任务中表现出色',
      displayName: 'SenseChat 4.0 128K',
      enabled: true,
      id: 'SenseChat-128K',
    },
    {
      contextWindowTokens: 32_768,
      description: '基础版本模型 (V4)，32K上下文长度，灵活应用于各类场景',
      displayName: 'SenseChat 4.0 32K',
      enabled: true,
      id: 'SenseChat-32K',
    },
    {
      contextWindowTokens: 4096,
      description: '基础版本模型 (V4)，4K上下文长度，通用能力强大',
      displayName: 'SenseChat 4.0 4K',
      enabled: true,
      id: 'SenseChat',
    },
    {
      contextWindowTokens: 8192,
      description: '标准版模型，8K上下文长度，高响应速度',
      displayName: 'SenseChat Character',
      id: 'SenseChat-Character',
    },
    {
      contextWindowTokens: 32_768,
      description: '高级版模型，32K上下文长度，能力全面提升，支持中/英文对话',
      displayName: 'SenseChat Character Pro',
      id: 'SenseChat-Character-Pro',
    },
  ],
  checkModel: 'SenseChat-Turbo',
  description: '商汤日日新，依托商汤大装置的强大的基础支撑，提供高效易用的全栈大模型服务。',
  disableBrowserRequest: true,
  id: 'sensenova',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.sensenova.cn/pricing',
  name: 'SenseNova',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.sensenova.cn/compatible-mode/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://platform.sensenova.cn/home',
};

export default SenseNova;
