import { ModelProviderCard } from '@/types/llm';

// ref https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html#_3-%E8%AF%B7%E6%B1%82%E8%AF%B4%E6%98%8E
// ref https://www.xfyun.cn/doc/spark/Web.html#_1-%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E
const Spark: ModelProviderCard = {
  chatModels: [
    {
      description: '轻量级大语言模型，低延迟，全免费 支持在线联网搜索功能 响应快速、便捷，全面免费开放 适用于低算力推理与模型精调等定制化场景',
      displayName: 'Spark Lite',
      enabled: true,
      functionCall: false,
      id: 'general',
      maxOutput: 4096,
      tokens: 8192,
    },
    {
      description: '专业级大语言模型，兼顾模型效果与性能 数学、代码、医疗、教育等场景专项优化 支持联网搜索、天气、日期等多个内置插件 覆盖大部分知识问答、语言理解、文本创作等多个场景',
      displayName: 'Spark Pro',
      enabled: true,
      functionCall: false,
      id: 'generalv3',
      maxOutput: 8192,
      tokens: 8192,
    },
    {
      description: '支持最长上下文的星火大模型，长文无忧 128K星火大模型强势来袭 通读全文，旁征博引 沟通无界，逻辑连贯',
      displayName: 'Spark Pro-128K',
      enabled: true,
      functionCall: false,
      id: 'Pro-128k',
      maxOutput: 4096,
      tokens: 128_000,
    },
    {
      description: '最全面的星火大模型版本，功能丰富 支持联网搜索、天气、日期等多个内置插件 核心能力全面升级，各场景应用效果普遍提升 支持System角色人设与FunctionCall函数调用',
      displayName: 'Spark3.5 Max',
      enabled: true,
      functionCall: false,
      id: 'generalv3.5',
      maxOutput: 8192,
      tokens: 8192,
    },
    {
      description: '最强大的星火大模型版本，效果极佳 全方位提升效果，引领智能巅峰 优化联网搜索链路，提供精准回答 强化文本总结能力，提升办公生产力',
      displayName: 'Spark4.0 Ultra',
      enabled: true,
      functionCall: false,
      id: '4.0Ultra',
      maxOutput: 8192,
      tokens: 8192,
    },
  ],
  checkModel: 'general',
  id: 'spark',
  modelList: { showModelFetcher: true },
  name: 'Spark',
  smoothing: {
    speed: 2,
    text: true,
  },
};

export default Spark;
