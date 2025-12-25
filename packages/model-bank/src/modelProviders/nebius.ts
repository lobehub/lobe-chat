import { ModelProviderCard } from '@/types/llm';

const Nebius: ModelProviderCard = {
    chatModels: [],
    checkModel: 'Qwen/Qwen2.5-Coder-7B',
    description: 'Nebius 通过构建大规模GPU集群和垂直整合的云平台，为全球AI创新者提供高性能基础设施。',
    id: 'nebius',
    modelsUrl: 'https://studio.nebius.com/',
    name: 'Nebius',
    settings: {
        proxyUrl: {
            placeholder: 'https://api.studio.nebius.com/v1',
        },
        sdkType: 'openai',
        showModelFetcher: true,
    },
    url: 'https://nebius.com/',
};

export default Nebius;
