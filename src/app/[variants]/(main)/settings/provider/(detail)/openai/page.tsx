import { OpenAIProviderCard } from '@/config/modelProviders';

import ProviderDetail from '../[id]';
import { useSettingsContext } from '../../../_layout/ContextProvider';

const Page =() => {
  const { showOpenAIProxyUrl, showOpenAIApiKey } = useSettingsContext()

  return (
    <ProviderDetail
      {...OpenAIProviderCard}
      settings={{
        ...OpenAIProviderCard.settings,
        proxyUrl: showOpenAIProxyUrl && {
          placeholder: 'https://api.openai.com/v1',
        },
        showApiKey: showOpenAIApiKey,
      }}
    />
  );
};

export default Page;
