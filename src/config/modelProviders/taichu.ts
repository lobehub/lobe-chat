import { ModelProviderCard } from '@/types/llm';

// ref :https://ai-maas.wair.ac.cn/#/doc
const Taichu: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 32_768,
      description: '基于海量高质数据训练，具有更强的文本理解、内容创作、对话问答等能力',
      displayName: 'Taichu 2.0',
      enabled: true,
      functionCall: true,
      id: 'taichu_llm',
    },
    {
      contextWindowTokens: 4096,
      description: '融合了图像理解、知识迁移、逻辑归因等能力，在图文问答领域表现突出',
      displayName: 'Taichu 2.0V',
      enabled: true,
      id: 'taichu2_mm',
      vision: true,
    },
  ],
  checkModel: 'taichu_llm',
  description:
    '中科院自动化研究所和武汉人工智能研究院推出新一代多模态大模型，支持多轮问答、文本创作、图像生成、3D理解、信号分析等全面问答任务，拥有更强的认知、理解、创作能力，带来全新互动体验。',
  id: 'taichu',
  modelsUrl: 'https://ai-maas.wair.ac.cn/#/doc',
  name: 'Taichu',
  settings: {
    proxyUrl: {
      placeholder: 'https://ai-maas.wair.ac.cn/maas/v1',
    },
    sdkType: 'openai',
  },
  url: 'https://ai-maas.wair.ac.cn',
};

export default Taichu;
