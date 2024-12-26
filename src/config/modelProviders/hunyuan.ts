import { ModelProviderCard } from '@/types/llm';

// ref https://cloud.tencent.com/document/product/1729/104753
const Hunyuan: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 256_000,
      description:
        '升级为 MOE 结构，上下文窗口为 256k ，在 NLP，代码，数学，行业等多项评测集上领先众多开源模型。',
      displayName: 'Hunyuan Lite',
      enabled: true,
      id: 'hunyuan-lite',
      maxOutput: 6000,
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
    },
    {
      contextWindowTokens: 32_000,
      description:
        '采用更优的路由策略，同时缓解了负载均衡和专家趋同的问题。长文方面，大海捞针指标达到99.9%。MOE-32K 性价比相对更高，在平衡效果、价格的同时，可对实现对长文本输入的处理。',
      displayName: 'Hunyuan Standard',
      enabled: true,
      id: 'hunyuan-standard',
      maxOutput: 2000,
      pricing: {
        currency: 'CNY',
        input: 4.5,
        output: 5,
      },
    },
    {
      contextWindowTokens: 256_000,
      description:
        '采用更优的路由策略，同时缓解了负载均衡和专家趋同的问题。长文方面，大海捞针指标达到99.9%。MOE-256K 在长度和效果上进一步突破，极大的扩展了可输入长度。',
      displayName: 'Hunyuan Standard 256K',
      enabled: true,
      id: 'hunyuan-standard-256K',
      maxOutput: 6000,
      pricing: {
        currency: 'CNY',
        input: 15,
        output: 60,
      },
    },
    {
      contextWindowTokens: 32_000,
      description:
        '混元全新一代大语言模型的预览版，采用全新的混合专家模型（MoE）结构，相比hunyuan-pro推理效率更快，效果表现更强。',
      displayName: 'Hunyuan Turbo',
      enabled: true,
      functionCall: true,
      id: 'hunyuan-turbo',
      maxOutput: 4000,
      pricing: {
        currency: 'CNY',
        input: 15,
        output: 50,
      },
    },
    {
      contextWindowTokens: 32_000,
      description:
        '万亿级参数规模 MOE-32K 长文模型。在各种 benchmark 上达到绝对领先的水平，复杂指令和推理，具备复杂数学能力，支持 functioncall，在多语言翻译、金融法律医疗等领域应用重点优化。',
      displayName: 'Hunyuan Pro',
      enabled: true,
      functionCall: true,
      id: 'hunyuan-pro',
      maxOutput: 4000,
      pricing: {
        currency: 'CNY',
        input: 30,
        output: 100,
      },
    },
    {
      contextWindowTokens: 8000,
      description: '混元最新多模态模型，支持图片+文本输入生成文本内容。',
      displayName: 'Hunyuan Vision',
      enabled: true,
      id: 'hunyuan-vision',
      maxOutput: 4000,
      pricing: {
        currency: 'CNY',
        input: 18,
        output: 18,
      },
      vision: true,
    },
    {
      contextWindowTokens: 8000,
      description:
        '混元最新代码生成模型，经过 200B 高质量代码数据增训基座模型，迭代半年高质量 SFT 数据训练，上下文长窗口长度增大到 8K，五大语言代码生成自动评测指标上位居前列；五大语言10项考量各方面综合代码任务人工高质量评测上，性能处于第一梯队',
      displayName: 'Hunyuan Code',
      id: 'hunyuan-code',
      maxOutput: 4000,
      pricing: {
        currency: 'CNY',
        input: 4,
        output: 8,
      },
    },
    {
      contextWindowTokens: 32_000,
      description:
        '混元最新 MOE 架构 FunctionCall 模型，经过高质量的 FunctionCall 数据训练，上下文窗口达 32K，在多个维度的评测指标上处于领先。',
      displayName: 'Hunyuan FunctionCall',
      functionCall: true,
      id: 'hunyuan-functioncall',
      maxOutput: 4000,
      pricing: {
        currency: 'CNY',
        input: 4,
        output: 8,
      },
    },
    {
      contextWindowTokens: 8000,
      description:
        '混元最新版角色扮演模型，混元官方精调训练推出的角色扮演模型，基于混元模型结合角色扮演场景数据集进行增训，在角色扮演场景具有更好的基础效果。',
      displayName: 'Hunyuan Role',
      id: 'hunyuan-role',
      maxOutput: 4000,
      pricing: {
        currency: 'CNY',
        input: 4,
        output: 8,
      },
    },
  ],
  checkModel: 'hunyuan-lite',
  description:
    '由腾讯研发的大语言模型，具备强大的中文创作能力，复杂语境下的逻辑推理能力，以及可靠的任务执行能力',
  disableBrowserRequest: true,
  id: 'hunyuan',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://cloud.tencent.com/document/product/1729/104753',
  name: 'Hunyuan',
  url: 'https://hunyuan.tencent.com',
};

export default Hunyuan;
