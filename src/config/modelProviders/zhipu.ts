import { ModelProviderCard } from '@/types/llm';

// ref :https://open.bigmodel.cn/dev/howuse/model
// api https://open.bigmodel.cn/dev/api#language
// ref :https://open.bigmodel.cn/modelcenter/square
const ZhiPu: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 128_000,
      description: 'GLM-4-Flash 是处理简单任务的理想选择，速度最快且免费。',
      displayName: 'GLM-4-Flash',
      enabled: true,
      functionCall: true,
      id: 'glm-4-flash',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'GLM-4-FlashX 是Flash的增强版本，超快推理速度。',
      displayName: 'GLM-4-FlashX',
      enabled: true,
      functionCall: true,
      id: 'glm-4-flashx',
      pricing: {
        currency: 'CNY',
        input: 0.1,
        output: 0.1,
      },
    },
    {
      contextWindowTokens: 1_024_000,
      description: 'GLM-4-Long 支持超长文本输入，适合记忆型任务与大规模文档处理。',
      displayName: 'GLM-4-Long',
      functionCall: true,
      id: 'glm-4-long',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 1,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'GLM-4-Air 是性价比高的版本，性能接近GLM-4，提供快速度和实惠的价格。',
      displayName: 'GLM-4-Air',
      enabled: true,
      functionCall: true,
      id: 'glm-4-air',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 1,
      },
    },
    {
      contextWindowTokens: 8192,
      description: 'GLM-4-AirX 提供 GLM-4-Air 的高效版本，推理速度可达其2.6倍。',
      displayName: 'GLM-4-AirX',
      enabled: true,
      functionCall: true,
      id: 'glm-4-airx',
      pricing: {
        currency: 'CNY',
        input: 10,
        output: 10,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        'GLM-4-AllTools 是一个多功能智能体模型，优化以支持复杂指令规划与工具调用，如网络浏览、代码解释和文本生成，适用于多任务执行。',
      displayName: 'GLM-4-AllTools',
      functionCall: true,
      id: 'glm-4-alltools',
      pricing: {
        currency: 'CNY',
        input: 100,
        output: 100,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        'GLM-4-Plus 作为高智能旗舰，具备强大的处理长文本和复杂任务的能力，性能全面提升。',
      displayName: 'GLM-4-Plus',
      enabled: true,
      functionCall: true,
      id: 'glm-4-plus',
      pricing: {
        currency: 'CNY',
        input: 50,
        output: 50,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'GLM-4-0520 是最新模型版本，专为高度复杂和多样化任务设计，表现卓越。',
      displayName: 'GLM-4-0520',
      functionCall: true,
      id: 'glm-4-0520',
      pricing: {
        currency: 'CNY',
        input: 100,
        output: 100,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'GLM-4 是发布于2024年1月的旧旗舰版本，目前已被更强的 GLM-4-0520 取代。',
      displayName: 'GLM-4',
      functionCall: true,
      id: 'glm-4',
      pricing: {
        currency: 'CNY',
        input: 100,
        output: 100,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        'GLM-4V-Flash 专注于高效的单一图像理解，适用于快速图像解析的场景，例如实时图像分析或批量图像处理。',
      displayName: 'GLM-4V-Flash',
      enabled: true,
      id: 'glm-4v-flash',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2024-12-09',
      vision: true,
    },
    {
      contextWindowTokens: 8192,
      description: 'GLM-4V-Plus 具备对视频内容及多图片的理解能力，适合多模态任务。',
      displayName: 'GLM-4V-Plus',
      enabled: true,
      id: 'glm-4v-plus',
      pricing: {
        currency: 'CNY',
        input: 10,
        output: 10,
      },
      vision: true,
    },
    {
      contextWindowTokens: 2048,
      description: 'GLM-4V 提供强大的图像理解与推理能力，支持多种视觉任务。',
      displayName: 'GLM-4V',
      id: 'glm-4v',
      pricing: {
        currency: 'CNY',
        input: 50,
        output: 50,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'CodeGeeX-4 是强大的AI编程助手，支持多种编程语言的智能问答与代码补全，提升开发效率。',
      displayName: 'CodeGeeX-4',
      id: 'codegeex-4',
      pricing: {
        currency: 'CNY',
        input: 0.1,
        output: 0.1,
      },
    },
    {
      contextWindowTokens: 4096,
      description: 'CharGLM-3 专为角色扮演与情感陪伴设计，支持超长多轮记忆与个性化对话，应用广泛。',
      displayName: 'CharGLM-3',
      id: 'charglm-3',
      pricing: {
        currency: 'CNY',
        input: 15,
        output: 15,
      },
    },
    {
      contextWindowTokens: 8192,
      description: 'Emohaa 是心理模型，具备专业咨询能力，帮助用户理解情感问题。',
      displayName: 'Emohaa',
      id: 'emohaa',
      pricing: {
        currency: 'CNY',
        input: 15,
        output: 15,
      },
    },
  ],
  checkModel: 'glm-4-flash',
  description:
    '智谱 AI 提供多模态与语言模型的开放平台，支持广泛的AI应用场景，包括文本处理、图像理解与编程辅助等。',
  id: 'zhipu',
  modelsUrl: 'https://open.bigmodel.cn/dev/howuse/model',
  name: 'ZhiPu',
  url: 'https://zhipuai.cn',
};

export default ZhiPu;
