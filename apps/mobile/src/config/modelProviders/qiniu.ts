import { ModelProviderCard } from '@/types/llm';

// ref: https://developer.qiniu.com/aitokenapi
const Qiniu: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 131_072,
      description:
        '推理速度大幅提升，位居开源模型之首，媲美顶尖闭源模型。采用负载均衡辅助策略和多标记预测训练，性能显著增强。',
      displayName: 'DeepSeek V3',
      enabled: true,
      id: 'deepseek-v3',
    },
    {
      contextWindowTokens: 65_536,
      description:
        'DeepSeek R1 是 DeepSeek 团队发布的最新开源模型，具备非常强悍的推理性能，尤其在数学、编程和推理任务上达到了与 OpenAI 的 o1 模型相当的水平',
      displayName: 'DeepSeek R1',
      enabled: true,
      id: 'deepseek-r1',
    },
  ],
  checkModel: 'deepseek-r1',
  description: '七牛作为老牌云服务厂商，提供高性价比稳定的实时、批量 AI 推理服务，简单易用。',
  id: 'qiniu',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://developer.qiniu.com/aitokenapi/12882/ai-inference-api',
  name: 'Qiniu',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.qnaigc.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://www.qiniu.com',
};

export default Qiniu;
