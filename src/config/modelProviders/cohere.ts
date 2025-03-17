import { ModelProviderCard } from '@/types/llm';

const Cohere: ModelProviderCard = {
  chatModels: [],
  checkModel: 'command',
  description: 'Cohere',
  //disableBrowserRequest: true,
  id: 'cohere',
  modelsUrl: 'https://docs.cohere.com/v2/docs/models',
  name: 'Cohere',
  settings: {
    //disableBrowserRequest: true,
    sdkType: 'openai',
  },
  url: 'https://cohere.com',
};

export default Cohere;
