import { ModelProviderCard } from '@/types/llm';

const Higress: ModelProviderCard = {
  chatModels: [],
  checkModel: 'qwen-max',
  description:
    'Higress 是一款云原生 API 网关，在阿里内部为解决 Tengine reload 对长连接业务有损，以及 gRPC/Dubbo 负载均衡能力不足而诞生。',
  id: 'higress',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://higress.cn/',
  name: 'Higress',
  proxyUrl: {
    desc: '输入Higress AI Gateway的访问地址',
    placeholder: 'https://127.0.0.1:8080/v1',
    title: 'AI Gateway地址',
  },
  settings: {
    proxyUrl: {
      desc: '输入Higress AI Gateway的访问地址',
      placeholder: 'https://127.0.0.1:8080/v1',
      title: 'AI Gateway地址',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://apig.console.aliyun.com/',
};

export default Higress;
