import { ModelProviderCard } from '@/types/llm';

// ref https://open.bigmodel.cn/dev/howuse/model
// api https://open.bigmodel.cn/dev/api#language
// ref https://open.bigmodel.cn/modelcenter/square
const ZhiPu: ModelProviderCard = {
  chatModels: [
    {
      description: '超长输入：专为处理超长文本和记忆型任务设计',
      displayName: 'GLM-4-Long',
      enabled: true,
      functionCall: true,
      id: 'glm-4-long',
      tokens: 1_024_000,
    },
    {
      description:
        'GLM-4-AllTools 是专门为支持智能体和相关任务而进一步优化的模型版本。它能够自主理解用户的意图，规划复杂的指令，并能够调用一个或多个工具（例如网络浏览器、代码解释器和文本生图像）以完成复杂的任务。',
      displayName: 'GLM-4-AllTools',
      enabled: true,
      functionCall: true,
      id: 'glm-4-alltools',
      tokens: 128_000,
    },
    {
      description: '智谱当前最先进最智能的模型，指令遵从能力大幅提升18.6%，发布于20240605',
      displayName: 'GLM-4-0520',
      enabled: true,
      functionCall: true,
      id: 'glm-4-0520',
      tokens: 128_000,
    },
    {
      description: '发布于2024年1月16日的旧版旗舰模型，目前已被 GLM-4-0520 版本超越', // deprecated on 2025-06
      displayName: 'GLM-4',
      functionCall: true,
      id: 'glm-4',
      tokens: 128_000,
    },
    {
      description: '性价比最高的版本，综合性能接近GLM-4，速度快，价格实惠',
      displayName: 'GLM-4-Air',
      enabled: true,
      functionCall: true,
      id: 'glm-4-air',
      tokens: 128_000,
    },
    {
      description: 'GLM-4-Air 的高性能版本，效果不变，推理速度达到其2.6倍',
      displayName: 'GLM-4-AirX',
      functionCall: true,
      id: 'glm-4-airx',
      tokens: 8192,
    },
    {
      description: '适用简单任务，速度最快，价格最实惠的版本',
      displayName: 'GLM-4-Flash',
      enabled: true,
      functionCall: true,
      id: 'glm-4-flash',
      tokens: 128_000,
    },
    {
      description:
        '实现了视觉语言特征的深度融合，支持视觉问答、图像字幕、视觉定位、复杂目标检测等各类图像理解任务',
      displayName: 'GLM-4V',
      enabled: true,
      id: 'glm-4v',
      tokens: 2000,
      vision: true,
    },
    {
      description:
        'CodeGeeX是一款强大的AI编程助手，提供智能问答和代码补全功能，支持多种编程语言，帮助开发者提高编程效率。',
      displayName: 'CodeGeeX-4',
      id: 'codegeex-4',
      tokens: 128_000,
    },
    {
      description:
        '支持基于人设的角色扮演、超长多轮的记忆、千人千面的角色对话，广泛应用于情感陪伴、游戏智能NPC、网红/明星/影视剧IP分身、数字人/虚拟主播、文字冒险游戏等拟人对话或游戏场景。',
      displayName: 'CharGLM-3',
      id: 'charglm-3',
      tokens: 4096,
    },
    {
      description: '心理模型：具备专业咨询能力，帮助用户理解情感并应对情绪问题',
      displayName: 'Emohaa',
      id: 'emohaa',
      tokens: 8192,
    },
  ],
  checkModel: 'glm-4-flash',
  id: 'zhipu',
  name: 'ZhiPu',
};

export default ZhiPu;
