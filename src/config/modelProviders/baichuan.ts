import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.baichuan-ai.com/price
const Baichuan: ModelProviderCard = {
  chatModels: [],
  checkModel: 'Baichuan3-Turbo',
  description:
    '百川智能是一家专注于人工智能大模型研发的公司，其模型在国内知识百科、长文本处理和生成创作等中文任务上表现卓越，超越了国外主流模型。百川智能还具备行业领先的多模态能力，在多项权威评测中表现优异。其模型包括 Baichuan 4、Baichuan 3 Turbo 和 Baichuan 3 Turbo 128k 等，分别针对不同应用场景进行优化，提供高性价比的解决方案。',
  id: 'baichuan',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.baichuan-ai.com/price',
  name: 'Baichuan',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.baichuan-ai.com/v1',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://platform.baichuan-ai.com',
};

export default Baichuan;
