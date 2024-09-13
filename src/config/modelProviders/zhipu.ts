import { ModelProviderCard } from '@/types/llm';

// ref :https://open.bigmodel.cn/dev/howuse/model
// api https://open.bigmodel.cn/dev/api#language
// ref :https://open.bigmodel.cn/modelcenter/square
const ZhiPu: ModelProviderCard = {
  chatModels: [
    {
      description:
        'GLM-4-AllTools 是一个多功能智能体模型，优化以支持复杂指令规划与工具调用，如网络浏览、代码解释和文本生成，适用于多任务执行。',
      displayName: 'GLM-4-AllTools',
      enabled: true,
      functionCall: true,
      id: 'glm-4-alltools',
      tokens: 128_000,
    },
    {
      description:
        'GLM-4-Plus 作为高智能旗舰，具备强大的处理长文本和复杂任务的能力，性能全面提升。',
      displayName: 'GLM-4-Plus',
      enabled: true,
      functionCall: true,
      id: 'glm-4-plus',
      tokens: 128_000,
    },
    {
      description: 'GLM-4-0520 是最新模型版本，专为高度复杂和多样化任务设计，表现卓越。',
      displayName: 'GLM-4-0520',
      enabled: true,
      functionCall: true,
      id: 'glm-4-0520',
      tokens: 128_000,
    },
    {
      description: 'GLM-4 是发布于2024年1月的旧旗舰版本，目前已被更强的 GLM-4-0520 取代。',
      displayName: 'GLM-4',
      functionCall: true,
      id: 'glm-4',
      tokens: 128_000,
    },
    {
      description: 'GLM-4-Air 是性价比高的版本，性能接近GLM-4，提供快速度和实惠的价格。',
      displayName: 'GLM-4-Air',
      enabled: true,
      functionCall: true,
      id: 'glm-4-air',
      tokens: 128_000,
    },
    {
      description: 'GLM-4-AirX 提供 GLM-4-Air 的高效版本，推理速度可达其2.6倍。',
      displayName: 'GLM-4-AirX',
      functionCall: true,
      id: 'glm-4-airx',
      tokens: 8192,
    },
    {
      description: 'GLM-4-Long 支持超长文本输入，适合记忆型任务与大规模文档处理。',
      displayName: 'GLM-4-Long',
      enabled: true,
      functionCall: true,
      id: 'glm-4-long',
      tokens: 1_024_000,
    },
    {
      description: 'GLM-4-Flash 是处理简单任务的理想选择，速度最快且价格最优惠。',
      displayName: 'GLM-4-Flash',
      enabled: true,
      functionCall: true,
      id: 'glm-4-flash',
      tokens: 128_000,
    },
    {
      description: 'GLM-4V-Plus 具备对视频内容及多图片的理解能力，适合多模态任务。',
      displayName: 'GLM-4V-Plus',
      enabled: true,
      id: 'glm-4v-plus',
      tokens: 8192,
      vision: true,
    },
    {
      description: 'GLM-4V 提供强大的图像理解与推理能力，支持多种视觉任务。',
      displayName: 'GLM-4V',
      enabled: true,
      id: 'glm-4v',
      tokens: 2048,
      vision: true,
    },
    {
      description:
        'CodeGeeX-4 是强大的AI编程助手，支持多种编程语言的智能问答与代码补全，提升开发效率。',
      displayName: 'CodeGeeX-4',
      id: 'codegeex-4',
      tokens: 128_000,
    },
    {
      description: 'CharGLM-3 专为角色扮演与情感陪伴设计，支持超长多轮记忆与个性化对话，应用广泛。',
      displayName: 'CharGLM-3',
      id: 'charglm-3',
      tokens: 4096,
    },
    {
      description: 'Emohaa 是心理模型，具备专业咨询能力，帮助用户理解情感问题。',
      displayName: 'Emohaa',
      id: 'emohaa',
      tokens: 8192,
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
