import { ModelProviderCard } from '@/types/llm';

// ref https://console.sensecore.cn/help/docs/model-as-a-service/nova/model/llm/GeneralLLM
// ref https://console.sensecore.cn/help/docs/model-as-a-service/nova/pricing
const SenseCore: ModelProviderCard = {
  chatModels: [
    {
      description: '版本：V5.5。日日新系列目前的主力大模型，国内首个流式多模态交互大模型，显著提升数理逻辑和指令跟随能力，综合性能较「SenseChat-5」提升30%，交互效果和多项核心指标实现对标GPT-4o。',
      displayName: 'SenseChat 5',
      enabled: true,
      functionCall: true,
      id: 'SenseChat-5',
      pricing: {
        currency: 'CNY',
        input: 40,
        output: 100,
      },
      tokens: 131_072,
    },
    {
      description: '基于SenseChat-5.0专门为适应粤语语种地区的对话习惯、俚语及本地知识而设计，显著提升在粤语本土化对话理解方面的能力，支持32k长文本输入。',
      displayName: 'SenseChat 5 Cantonese',
      id: 'SenseChat-5-Cantonese',
      pricing: {
        currency: 'CNY',
        input: 27,
        output: 27,
      },
      tokens: 32_768,
    },
    {
      description: 'SenseChat-4.0，支持4k上下文长度，响应快，在各项能力表现较为均衡，尤其在生成创作、角色扮演、安全能力、工具使用上表现较好。',
      displayName: 'SenseChat',
      enabled: true,
      id: 'SenseChat',
      pricing: {
        currency: 'CNY',
        input: 12,
        output: 12,
      },
      tokens: 4096,
    },
    {
      description: 'SenseChat-4.0，支持32k上下文长度，在各项能力表现较为均衡，尤其在生成创作、角色扮演、安全能力、工具使用上表现较好。',
      displayName: 'SenseChat 32K',
      enabled: true,
      id: 'SenseChat-32K',
      pricing: {
        currency: 'CNY',
        input: 36,
        output: 36,
      },
      tokens: 32_768,
    },
    {
      description: 'SenseChat-5.0，支持128k上下文长度，在各项能力表现较为均衡，尤其在生成创作、角色扮演、安全能力、工具使用上表现较好。',
      displayName: 'SenseChat 128K',
      enabled: true,
      id: 'SenseChat-128K',
      pricing: {
        currency: 'CNY',
        input: 60,
        output: 60,
      },
      tokens: 131_072,
    },
    {
      description: '基于SenseChat-5.0的轻量版本，模型运行速度更快，支持32k最大上下文长度。',
      displayName: 'SenseChat Turbo',
      enabled: true,
      id: 'SenseChat-Turbo',
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 5,
      },
      tokens: 32_768,
    },
    {
      description: '版本：5.0。图文感知能力达到全球领先水平，在多模态大模型权威综合基准测试MMBench中综合得分排名首位，在多个知名多模态榜单MathVista、AI2D、ChartQA、TextVQA、DocVQA、MMMU 取得领先成绩。',
      displayName: 'SenseChat Vision',
      enabled: true,
      id: 'SenseChat-Vision',
      pricing: {
        currency: 'CNY',
        input: 100,
        output: 100,
      },
      tokens: 4096,
    },
    {
      description: '商汤支持设置角色创建、知识库构建、多人群聊、角色其密度等能力，支持8K上下文长度。',
      displayName: 'SenseChat Character',
      id: 'SenseChat-Character',
      pricing: {
        currency: 'CNY',
        input: 12,
        output: 12,
      },
      tokens: 8192,
    },
    {
      description: '在标准版的基础上，角色对话、人设、及剧情推动能力全面提升；支持32K上下文长度；支持中/英文对话，赋能海外拟人对话场景。',
      displayName: 'SenseChat Character Pro',
      id: 'SenseChat-Character-Pro',
      pricing: {
        currency: 'CNY',
        input: 15,
        output: 15,
      },
      tokens: 32_768,
    },
  ],
  checkModel: 'SenseChat-Turbo',
  id: 'sensecore',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://console.sensecore.cn/help/docs/model-as-a-service/nova/model/llm/GeneralLLM',
  name: 'SenseCore',
  url: 'https://console.sensecore.cn/aistudio',
};

export default SenseCore;
