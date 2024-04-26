import { OpenAI } from '@lobehub/icons';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { featureFlagsSelectors } from '@/store/global/selectors';

import ProviderConfig from '../components/ProviderConfig';

const OpenAIProvider = memo(() => {
  const showOpenAIProxyUrl = useGlobalStore(featureFlagsSelectors.showOpenAIProxyUrl);
  const showOpenAIApiKey = useGlobalStore(featureFlagsSelectors.showOpenAIApiKey);

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
