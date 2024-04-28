import { LOBE_CHAT_ACCESS_CODE, OPENAI_API_KEY_HEADER_KEY, OPENAI_END_POINT } from '@/const/fetch';
import { useUserStore } from '@/store/user';
import { modelConfigSelectors, settingsSelectors } from '@/store/user/selectors';

/**
 * TODO: Need to be removed after tts refactor
 * @deprecated
 */
// eslint-disable-next-line no-undef
export const createHeaderWithOpenAI = (header?: HeadersInit): HeadersInit => {
  const openAIConfig = modelConfigSelectors.openAIConfig(useUserStore.getState());

  // eslint-disable-next-line no-undef
  return {
    ...header,
    [LOBE_CHAT_ACCESS_CODE]: settingsSelectors.password(useUserStore.getState()),
    [OPENAI_API_KEY_HEADER_KEY]: openAIConfig.apiKey || '',
    [OPENAI_END_POINT]: openAIConfig.endpoint || '',
  };
};
