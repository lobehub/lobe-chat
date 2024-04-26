import { OpenAI } from '@lobehub/icons';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { featureFlagsSelectors } from '@/store/global/selectors';

import ProviderConfig from '../components/ProviderConfig';

const OpenAIProvider = memo(() => {
  const hideOpenAIProxyUrl = useGlobalStore(featureFlagsSelectors.hideOpenAIProxyUrl);
  const hideOpenAIApiKey = useGlobalStore(featureFlagsSelectors.hideOpenAIApiKey);

  return (
    <ProviderConfig
      modelList={{ showModelFetcher: true }}
      provider={'openai'}
      showApiKey={!hideOpenAIApiKey}
      showEndpoint={!hideOpenAIProxyUrl}
      title={<OpenAI.Combine size={24} />}
    />
  );
});

export default OpenAIProvider;
