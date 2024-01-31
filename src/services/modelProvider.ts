import { createHeaderWithOpenAI } from './_header';
import { OPENAI_URLS } from './_url';

class ModelProviderService {
  getOpenAIModelList = async (): Promise<string[]> => {
    const res = await fetch(OPENAI_URLS.models, {
      headers: createHeaderWithOpenAI(),
      method: 'POST',
    });

    return res.json();
  };
}

export const modelProviderService = new ModelProviderService();
