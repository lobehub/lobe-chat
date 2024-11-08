import {
  LOBE_CHAT_ACCESS_CODE,
  LOBE_USER_ID,
  OPENAI_API_KEY_HEADER_KEY,
  OPENAI_END_POINT,
} from '@/const/fetch';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';

/**
 * TODO: Need to be removed after tts refactor
 * @deprecated
 */
// eslint-disable-next-line no-undef
export const createHeaderWithOpenAI = (header?: HeadersInit): HeadersInit => {
  const state = useUserStore.getState();
  const openAIConfig = keyVaultsConfigSelectors.openAIConfig(state);

  // eslint-disable-next-line no-undef
  return {
    ...header,
    [LOBE_CHAT_ACCESS_CODE]: keyVaultsConfigSelectors.password(state),
    [LOBE_USER_ID]: state.user?.id || '',
    [OPENAI_API_KEY_HEADER_KEY]: openAIConfig.apiKey || '',
    [OPENAI_END_POINT]: openAIConfig.baseURL || '',
  };
};
