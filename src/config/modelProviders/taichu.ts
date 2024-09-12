import { ModelProviderCard } from '@/types/llm';

// ref :https://ai-maas.wair.ac.cn/#/doc
const Taichu: ModelProviderCard = {
  chatModels: [
    {
      description:
        '紫东太初语言大模型具备超强语言理解能力以及文本创作、知识问答、代码编程、数学计算、逻辑推理、情感分析、文本摘要等能力。创新性地将大数据预训练与多源丰富知识相结合，通过持续打磨算法技术，并不断吸收海量文本数据中词汇、结构、语法、语义等方面的新知识，实现模型效果不断进化。为用户提供更加便捷的信息和服务以及更为智能化的体验。',
      displayName: 'Taichu-2.0',
      enabled: true,
      functionCall: false,
      id: 'taichu_llm',
      tokens: 32_768,
    },
  ],
  checkModel: 'taichu_llm',
  description:
    '中科院自动化研究所和武汉人工智能研究院推出新一代多模态大模型，支持多轮问答、文本创作、图像生成、3D理解、信号分析等全面问答任务，拥有更强的认知、理解、创作能力，带来全新互动体验。',
  id: 'taichu',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ai-maas.wair.ac.cn/#/doc',
  name: 'Taichu',
  url: 'https://ai-maas.wair.ac.cn',
};

export default Taichu;
