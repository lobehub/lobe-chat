import {
  AZURE_OPENAI_API_VERSION,
  LOBE_CHAT_ACCESS_CODE,
  OPENAI_API_KEY_HEADER_KEY,
  OPENAI_END_POINT,
  USE_AZURE_OPENAI,
} from '@/const/fetch';
import { useGlobalStore } from '@/store/global';

// eslint-disable-next-line no-undef
export const createHeaderWithOpenAI = (header?: HeadersInit): HeadersInit => {
  const openai = useGlobalStore.getState().settings.languageModel.openAI;

  const apiKey = openai.OPENAI_API_KEY || useGlobalStore.getState().settings.OPENAI_API_KEY || '';
  const endpoint = openai.endpoint || useGlobalStore.getState().settings.endpoint || '';

  // eslint-disable-next-line no-undef
  const result: HeadersInit = {
    ...header,
    [LOBE_CHAT_ACCESS_CODE]: useGlobalStore.getState().settings.password || '',
    [OPENAI_API_KEY_HEADER_KEY]: apiKey,
    [OPENAI_END_POINT]: endpoint,
  };

  if (openai.useAzure) {
    Object.assign(result, {
      [AZURE_OPENAI_API_VERSION]: openai.azureApiVersion || '',
      [USE_AZURE_OPENAI]: '1',
    });
  }

  return result;
};
