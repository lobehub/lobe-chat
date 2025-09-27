import { ModelProviderCard } from '@/types/llm';

const OllamaCloud: ModelProviderCard = {
    chatModels: [],
    checkModel: 'gpt-oss:20b',
    description:
        'Ollama Cloud 提供官方托管的推理服务，开箱即用地访问 Ollama 模型库，并支持 OpenAI 兼容接口。',
    id: 'ollamacloud',
    modelsUrl: 'https://ollama.com/library',
    name: 'Ollama Cloud',
    settings: {
        sdkType: 'openai',
        showModelFetcher: true,
    },
    url: 'https://ollama.com/cloud',
};

export default OllamaCloud;
