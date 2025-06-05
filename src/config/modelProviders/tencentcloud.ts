import { ModelProviderCard } from '@/types/llm';

const TencentCloud: ModelProviderCard = {
  chatModels: [],
  checkModel: 'deepseek-v3',
  description:
    '知识引擎原子能力（LLM Knowledge Engine Atomic Power）基于知识引擎研发的知识问答全链路能力，面向企业及开发者，提供灵活组建及开发模型应用的能力。您可通过多款原子能力组建您专属的模型服务，调用文档解析、拆分、embedding、多轮改写等服务进行组装，定制企业专属 AI 业务。',
  id: 'tencentcloud',
  modelsUrl: 'https://cloud.tencent.com/document/api/1772/115963',
  name: 'TencentCloud',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.lkeap.cloud.tencent.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://cloud.tencent.com/document/api/1772/115365',
};

export default TencentCloud;
