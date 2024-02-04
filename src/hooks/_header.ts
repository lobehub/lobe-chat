import {
  AZURE_OPENAI_API_VERSION,
  LOBE_CHAT_ACCESS_CODE,
  OPENAI_API_KEY_HEADER_KEY,
  OPENAI_END_POINT,
  USE_AZURE_OPENAI,
} from '@/const/fetch';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors, settingsSelectors } from '@/store/global/selectors';

// TODO: Need to be removed after tts refactor
// eslint-disable-next-line no-undef
export const createHeaderWithOpenAI = (header?: HeadersInit): HeadersInit => {
  const openai = modelProviderSelectors.openAIConfig(useGlobalStore.getState());

  const apiKey = openai.OPENAI_API_KEY || '';
  const endpoint = openai.endpoint || '';

  // eslint-disable-next-line no-undef
  const result: HeadersInit = {
    ...header,
    [LOBE_CHAT_ACCESS_CODE]: settingsSelectors.password(useGlobalStore.getState()),
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
