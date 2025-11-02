import { ModelProviderCard } from '@/types/llm';

// ref: https://help.aliyun.com/zh/model-studio/getting-started/models
const Qwen: ModelProviderCard = {
  chatModels: [],
  checkModel: 'qwen-flash',
  description:
    '通义千问是阿里云自主研发的超大规模语言模型，具有强大的自然语言理解和生成能力。它可以回答各种问题、创作文字内容、表达观点看法、撰写代码等，在多个领域发挥作用。',
  disableBrowserRequest: true,
  id: 'qwen',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details',
  name: 'Aliyun Bailian',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    sdkType: 'openai',
    showDeployName: true,
    showModelFetcher: true,
  },
  url: 'https://www.aliyun.com/product/bailian',
};

export default Qwen;
