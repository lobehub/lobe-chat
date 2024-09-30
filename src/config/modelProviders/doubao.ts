import { ModelProviderCard } from '@/types/llm';

// ref https://www.volcengine.com/docs/82379/1330310
const Doubao: ModelProviderCard = {
  chatModels: [],
  disableBrowserRequest: true, // CORS error
  id: 'doubao',
  name: '豆包',
  url: 'https://www.volcengine.com/product/doubao',
};

export default Doubao;
