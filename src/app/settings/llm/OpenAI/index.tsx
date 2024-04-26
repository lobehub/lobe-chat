import { OpenAI } from '@lobehub/icons';
import { memo } from 'react';

import { featureFlagsSelectors, useFeatureFlagStore } from '@/store/featureFlags';

import ProviderConfig from '../components/ProviderConfig';

const OpenAIProvider = memo(() => {
  const showOpenAIProxyUrl = useFeatureFlagStore(featureFlagsSelectors.showOpenAIProxyUrl);
  const showOpenAIApiKey = useFeatureFlagStore(featureFlagsSelectors.showOpenAIApiKey);

  return (
    <ProviderConfig
      modelList={{ showModelFetcher: true }}
      provider={'openai'}
      showApiKey={showOpenAIApiKey}
      showEndpoint={showOpenAIProxyUrl}
      title={<OpenAI.Combine size={24} />}
    />
  );
});

export default OpenAIProvider;
